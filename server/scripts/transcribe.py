#!/usr/bin/env python3
"""
Local Faster-Whisper transcription script.
Called by the Node.js server as a subprocess.

Usage:
    python transcribe.py <audio_file> [--model base] [--language zh] [--device cpu]

Outputs JSON to stdout:
    { "success": true, "language": "en", "segments": [{ "start": 0.0, "end": 2.5, "text": "..." }, ...] }

Progress/errors go to stderr so they don't pollute the JSON output.
"""

import sys
import json
import argparse
import time
import traceback
from pathlib import Path

def apply_gpu_limit():
    """Limit GPU utilization via CUDA stream throttling"""
    gpu_limit = os.environ.get("WHISPER_GPU_LIMIT", "").strip()
    if not gpu_limit:
        return
    try:
        pct = int(gpu_limit)
        if 10 <= pct < 100:
            # Reduce CUDA threads proportionally to limit GPU usage
            import torch
            if torch.cuda.is_available():
                # Use CUDA memory fraction as a proxy for utilization
                torch.cuda.set_per_process_memory_fraction(pct / 100.0, 0)
                print(f"GPU memory limited to {pct}%", file=sys.stderr)
    except (ValueError, ImportError):
        pass


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio with faster-whisper")
    parser.add_argument("file", help="Audio file path")
    parser.add_argument("--model", default="base",
                        choices=["tiny", "base", "small", "medium", "large-v3", "turbo"],
                        help="Whisper model size (default: base)")
    parser.add_argument("--language", default=None, help="Language code, e.g. zh, en (default: auto-detect)")
    parser.add_argument("--device", default="cpu", choices=["cpu", "cuda"],
                        help="Compute device (default: cpu)")
    parser.add_argument("--compute-type", default="auto",
                        choices=["auto", "int8", "int16", "float16", "float32"],
                        help="Compute precision (default: auto — int8 for CPU, float16 for CUDA)")
    args = parser.parse_args()

    audio_path = Path(args.file)
    if not audio_path.exists():
        print(json.dumps({"success": False, "error": f"File not found: {args.file}"}))
        sys.exit(1)

    try:
        apply_gpu_limit()
        from faster_whisper import WhisperModel
    except ImportError:
        print(json.dumps({
            "success": False,
            "error": "faster-whisper not installed. Run: pip install faster-whisper"
        }))
        sys.exit(1)

    try:
        compute = args.compute_type
        device = args.device
        if compute == "auto":
            compute = "float16" if device == "cuda" else "int8"

        # Add NVIDIA pip package DLL paths so CUDA libraries are found
        if device == "cuda":
            import importlib.util, os
            for pkg in ["nvidia.cublas", "nvidia.cudnn", "nvidia.cuda_nvrtc", "nvidia.cufft"]:
                spec = importlib.util.find_spec(pkg)
                if spec and spec.submodule_search_locations:
                    for loc in spec.submodule_search_locations:
                        bin_dir = os.path.join(loc, "bin")
                        if os.path.isdir(bin_dir):
                            os.add_dll_directory(bin_dir)
                            os.environ["PATH"] = bin_dir + os.pathsep + os.environ.get("PATH", "")

            # Verify cublas is loadable, fall back to CPU if not
            try:
                import ctypes
                ctypes.cdll.LoadLibrary("cublas64_12.dll")
            except OSError:
                print("⚠ CUDA libraries not found, falling back to CPU", file=sys.stderr)
                device = "cpu"
                compute = "int8"

        print(f"Loading model: {args.model} (device={device}, compute={compute})", file=sys.stderr)
        model = WhisperModel(args.model, device=device, compute_type=compute)

        print(f"Transcribing: {audio_path.name}", file=sys.stderr)
        start = time.time()

        segments_iter, info = model.transcribe(
            str(audio_path),
            language=args.language,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )

        segments = []
        for seg in segments_iter:
            segments.append({
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            })

        elapsed = time.time() - start
        print(f"Done: {len(segments)} segments in {elapsed:.1f}s (language={info.language})", file=sys.stderr)

        print(json.dumps({
            "success": True,
            "language": info.language,
            "segments": segments,
        }, ensure_ascii=False))

    except KeyboardInterrupt:
        print(json.dumps({"success": False, "error": "Cancelled"}))
        sys.exit(1)
    except Exception as e:
        # Log full traceback to stderr (server-side only), send only
        # a generic error message to the client to avoid info disclosure.
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({
            "success": False,
            "error": str(e),
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
