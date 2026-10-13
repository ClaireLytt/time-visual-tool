import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import YouTubePlayer from './YouTubePlayer'
import { useYouTubeHistory, type WatchedVideo, type VideoFolder } from '../../hooks/useYouTubeHistory'
import { useWordHistory } from '../../hooks/useWordHistory'
import { extractVideoId, fetchYouTubeInfo, fetchYouTubeTranscript } from '../../api/youtube'
import { MODE_ACCENT } from '../../constants/modes'
import type { Segment } from '../../types/podcast'
import type { YouTubeVideoInfo } from '../../api/youtube'

type View =
  | { kind: 'home' }
  | { kind: 'player'; videoId: string; info: YouTubeVideoInfo; segments: Segment[] }
  | { kind: 'folder'; folderId: string }

const ACCENT = MODE_ACCENT.youtube
const FOLDER_ICONS = ['📁', '⭐', '📚', '🎬', '🎯', '💡', '🔥', '💎', '🎧', '🌍']

function YouTubeDashboard() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>({ kind: 'home' })
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  // Folder picker: which video is being assigned to a folder
  const [pickingFolderFor, setPickingFolderFor] = useState<string | null>(null)

  const {
    history, addToHistory, removeFromHistory, clearHistory,
    folders, createFolder, renameFolder, changeFolderIcon, deleteFolder,
    addToFolder, removeFromFolder, getFoldersForVideo,
  } = useYouTubeHistory()
  const {
    recordLookup, toggleBookmark, saveSentence, removeSentence,
    removeWord, sentences,
  } = useWordHistory('youtube')

  const savedSentenceTexts = useMemo(() => new Set(sentences.map(s => s.text)), [sentences])

  const loadVideo = useCallback(async (inputUrl: string) => {
    setError('')
    const videoId = extractVideoId(inputUrl.trim())
    if (!videoId) { setError(t('youtube.invalidUrl')); return }
    setLoading(true)
    try {
      const [info, segments] = await Promise.all([
        fetchYouTubeInfo(inputUrl.trim()),
        fetchYouTubeTranscript(videoId),
      ])
      addToHistory({ videoId: info.videoId, title: info.title, channelName: info.channelName, thumbnailUrl: info.thumbnailUrl })
      setView({ kind: 'player', videoId: info.videoId, info, segments })
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [t, addToHistory])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) loadVideo(url)
  }, [url, loadVideo])

  const handleVideoClick = useCallback((video: WatchedVideo) => {
    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`
    setUrl(videoUrl)
    loadVideo(videoUrl)
  }, [loadVideo])

  const handleCreateFolder = useCallback(() => {
    const name = newFolderName.trim()
    if (!name) return
    createFolder(name)
    setNewFolderName('')
    setShowNewFolder(false)
  }, [newFolderName, createFolder])

  const handleRename = useCallback((folderId: string) => {
    const name = editName.trim()
    if (name) renameFolder(folderId, name)
    setEditingFolder(null)
  }, [editName, renameFolder])

  // ── Player view ──
  if (view.kind === 'player') {
    return (
      <div id="main-content" className="space-y-3">
        <button
          onClick={() => setView({ kind: 'home' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          {t('youtube.back')}
        </button>
        <YouTubePlayer
          info={view.info}
          segments={view.segments}
          onRecordLookup={(word) => recordLookup(word, view.videoId, view.info.title)}
          onAddToVocab={toggleBookmark}
          onRemoveFromVocab={removeWord}
          onSaveSentence={saveSentence}
          onRemoveSentence={removeSentence}
          onRemoveWord={removeWord}
          savedSentences={savedSentenceTexts}
        />
      </div>
    )
  }

  // ── Folder detail view ──
  if (view.kind === 'folder') {
    const folder = folders.find(f => f.id === view.folderId)
    if (!folder) { setView({ kind: 'home' }); return null }
    const folderVideos = folder.videoIds.map(id => history.find(v => v.videoId === id)).filter(Boolean) as WatchedVideo[]

    return (
      <div id="main-content" className="space-y-4">
        <button
          onClick={() => setView({ kind: 'home' })}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          {t('youtube.back')}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{folder.icon}</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{folder.name}</h2>
          <span className="text-xs text-gray-400">{folderVideos.length} {t('youtube.videoCount')}</span>
        </div>

        {folderVideos.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">{t('youtube.folderEmpty')}</p>
        )}

        <div className="space-y-1.5">
          {folderVideos.map(video => (
            <VideoCard
              key={video.videoId}
              video={video}
              onClick={() => handleVideoClick(video)}
              onRemove={() => removeFromFolder(folder.id, video.videoId)}
              removeLabel={t('youtube.removeFromFolder')}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Home view ──
  return (
    <div id="main-content" className="space-y-4">
      {/* URL Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder={t('youtube.urlPlaceholder')}
            className="input-base flex-1 text-sm" disabled={loading}
          />
          <motion.button
            type="submit" whileTap={{ scale: 0.95 }}
            disabled={loading || !url.trim()}
            className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-opacity disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
              </svg>
            ) : t('youtube.load')}
          </motion.button>
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      </form>

      {/* ── Folders ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('youtube.folders')}</h3>
          <button
            onClick={() => setShowNewFolder(v => !v)}
            className="text-xs font-medium transition-colors"
            style={{ color: ACCENT }}
          >
            + {t('youtube.newFolder')}
          </button>
        </div>

        {/* New folder form */}
        {showNewFolder && (
          <form onSubmit={(e) => { e.preventDefault(); handleCreateFolder() }} className="flex gap-2">
            <input
              value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              placeholder={t('youtube.folderNamePlaceholder')}
              className="input-base flex-1 text-sm" autoFocus
            />
            <button type="submit" disabled={!newFolderName.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-40"
              style={{ backgroundColor: ACCENT }}
            >{t('youtube.create')}</button>
          </form>
        )}

        {/* Folder list */}
        {folders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {folders.map(folder => (
              <div key={folder.id} className="relative group">
                {editingFolder === folder.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleRename(folder.id) }} className="flex items-center gap-1">
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      className="input-base text-xs w-24" autoFocus
                      onBlur={() => handleRename(folder.id)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setView({ kind: 'folder', folderId: folder.id })}
                    className="panel flex items-center gap-2 px-3 py-2 no-press hover:shadow-elevated transition-shadow"
                  >
                    {/* Icon picker: cycle through icons on click */}
                    <span
                      className="text-lg cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        const idx = FOLDER_ICONS.indexOf(folder.icon)
                        changeFolderIcon(folder.id, FOLDER_ICONS[(idx + 1) % FOLDER_ICONS.length])
                      }}
                    >{folder.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{folder.name}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 rounded-full">{folder.videoIds.length}</span>
                  </button>
                )}
                {/* Edit/delete on hover */}
                <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                  <button
                    onClick={() => { setEditingFolder(folder.id); setEditName(folder.name) }}
                    className="w-5 h-5 rounded-full bg-white dark:bg-gray-700 shadow text-gray-400 hover:text-gray-600 flex items-center justify-center text-[10px]"
                  >✎</button>
                  <button
                    onClick={() => deleteFolder(folder.id)}
                    className="w-5 h-5 rounded-full bg-white dark:bg-gray-700 shadow text-gray-400 hover:text-red-500 flex items-center justify-center text-[10px]"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Watch History ── */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('youtube.history')}</h3>
            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              {t('youtube.clearHistory')}
            </button>
          </div>

          <div className="space-y-1.5">
            {history.slice(0, 20).map(video => (
              <div key={video.videoId} className="relative">
                <VideoCard
                  video={video}
                  onClick={() => handleVideoClick(video)}
                  onRemove={() => removeFromHistory(video.videoId)}
                  folderTags={getFoldersForVideo(video.videoId)}
                  onAddToFolder={() => setPickingFolderFor(video.videoId)}
                />
                {/* Folder picker dropdown */}
                {pickingFolderFor === video.videoId && (
                  <FolderPicker
                    folders={folders}
                    videoId={video.videoId}
                    onAdd={(fId) => { addToFolder(fId, video.videoId); setPickingFolderFor(null) }}
                    onRemove={(fId) => removeFromFolder(fId, video.videoId)}
                    onClose={() => setPickingFolderFor(null)}
                    getFoldersForVideo={getFoldersForVideo}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && folders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📺</div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('youtube.noHistory')}</p>
        </div>
      )}
    </div>
  )
}

/* ── Shared video card component ── */
function VideoCard({ video, onClick, onRemove, removeLabel, folderTags, onAddToFolder }: {
  video: WatchedVideo
  onClick: () => void
  onRemove: () => void
  removeLabel?: string
  folderTags?: VideoFolder[]
  onAddToFolder?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="panel w-full text-left flex gap-3 p-2 no-press group"
    >
      <img src={video.thumbnailUrl} alt="" className="w-24 h-14 object-cover rounded-lg shrink-0 bg-gray-100 dark:bg-gray-700" loading="lazy" />
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">{video.title}</p>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">{video.channelName}</span>
          {folderTags?.map(f => (
            <span key={f.id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
              {f.icon} {f.name}
            </span>
          ))}
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        {onAddToFolder && (
          <button onClick={(e) => { e.stopPropagation(); onAddToFolder() }}
            className="p-1 text-gray-400 hover:text-mode-youtube transition-colors" aria-label="Add to folder">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors" aria-label={removeLabel ?? 'Remove'}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.button>
  )
}

/* ── Folder picker dropdown ── */
function FolderPicker({ folders, videoId, onAdd, onRemove, onClose, getFoldersForVideo }: {
  folders: VideoFolder[]
  videoId: string
  onAdd: (folderId: string) => void
  onRemove: (folderId: string) => void
  onClose: () => void
  getFoldersForVideo: (id: string) => VideoFolder[]
}) {
  const inFolders = getFoldersForVideo(videoId)
  const inIds = new Set(inFolders.map(f => f.id))

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 z-50 panel p-2 shadow-dialog min-w-[160px] space-y-1">
        {folders.length === 0 && (
          <p className="text-xs text-gray-400 p-2">No folders yet</p>
        )}
        {folders.map(f => {
          const isIn = inIds.has(f.id)
          return (
            <button key={f.id}
              onClick={() => isIn ? onRemove(f.id) : onAdd(f.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                isIn ? 'bg-mode-youtube/10 text-mode-youtube' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{f.icon}</span>
              <span className="flex-1 text-left">{f.name}</span>
              {isIn && <span className="text-xs">✓</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

export default YouTubeDashboard
