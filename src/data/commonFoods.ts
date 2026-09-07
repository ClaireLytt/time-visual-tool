export interface FoodItem {
  name: string
  nameEn: string
  calories: number
  unit: string
}

export const COMMON_FOODS: FoodItem[] = [
  // 主食
  { name: '米饭(一碗)', nameEn: 'Rice (1 bowl)', calories: 230, unit: '200g' },
  { name: '馒头(一个)', nameEn: 'Steamed bun (1)', calories: 220, unit: '100g' },
  { name: '面条(一碗)', nameEn: 'Noodles (1 bowl)', calories: 280, unit: '200g' },
  { name: '面包(一片)', nameEn: 'Bread (1 slice)', calories: 80, unit: '35g' },
  { name: '包子(一个)', nameEn: 'Baozi (1)', calories: 200, unit: '100g' },
  { name: '饺子(10个)', nameEn: 'Dumplings (10)', calories: 300, unit: '200g' },
  { name: '粥(一碗)', nameEn: 'Congee (1 bowl)', calories: 90, unit: '250g' },
  { name: '红薯(一个)', nameEn: 'Sweet potato (1)', calories: 130, unit: '150g' },
  { name: '玉米(一根)', nameEn: 'Corn (1)', calories: 110, unit: '100g' },
  { name: '三明治', nameEn: 'Sandwich', calories: 300, unit: '150g' },

  // 肉蛋
  { name: '鸡胸肉', nameEn: 'Chicken breast', calories: 165, unit: '100g' },
  { name: '鸡蛋(一个)', nameEn: 'Egg (1)', calories: 75, unit: '50g' },
  { name: '牛肉', nameEn: 'Beef', calories: 190, unit: '100g' },
  { name: '猪肉(瘦)', nameEn: 'Pork (lean)', calories: 155, unit: '100g' },
  { name: '鱼肉', nameEn: 'Fish', calories: 120, unit: '100g' },
  { name: '虾', nameEn: 'Shrimp', calories: 85, unit: '100g' },
  { name: '豆腐', nameEn: 'Tofu', calories: 80, unit: '100g' },
  { name: '牛排', nameEn: 'Steak', calories: 270, unit: '150g' },

  // 蔬菜
  { name: '西兰花', nameEn: 'Broccoli', calories: 35, unit: '100g' },
  { name: '番茄', nameEn: 'Tomato', calories: 20, unit: '100g' },
  { name: '黄瓜', nameEn: 'Cucumber', calories: 15, unit: '100g' },
  { name: '生菜沙拉', nameEn: 'Green salad', calories: 50, unit: '150g' },
  { name: '炒青菜', nameEn: 'Stir-fried greens', calories: 80, unit: '150g' },
  { name: '土豆(炒)', nameEn: 'Fried potato', calories: 120, unit: '150g' },

  // 水果
  { name: '苹果(一个)', nameEn: 'Apple (1)', calories: 80, unit: '150g' },
  { name: '香蕉(一根)', nameEn: 'Banana (1)', calories: 90, unit: '100g' },
  { name: '橙子(一个)', nameEn: 'Orange (1)', calories: 60, unit: '150g' },
  { name: '葡萄(一串)', nameEn: 'Grapes (1 bunch)', calories: 70, unit: '100g' },
  { name: '西瓜(一块)', nameEn: 'Watermelon (1 slice)', calories: 50, unit: '150g' },
  { name: '草莓(10颗)', nameEn: 'Strawberries (10)', calories: 40, unit: '120g' },

  // 饮品
  { name: '牛奶(一杯)', nameEn: 'Milk (1 cup)', calories: 135, unit: '250ml' },
  { name: '豆浆(一杯)', nameEn: 'Soy milk (1 cup)', calories: 80, unit: '250ml' },
  { name: '酸奶(一杯)', nameEn: 'Yogurt (1 cup)', calories: 150, unit: '200g' },
  { name: '咖啡(黑)', nameEn: 'Black coffee', calories: 5, unit: '250ml' },
  { name: '拿铁', nameEn: 'Latte', calories: 190, unit: '350ml' },
  { name: '奶茶', nameEn: 'Milk tea', calories: 350, unit: '500ml' },
  { name: '可乐(一罐)', nameEn: 'Cola (1 can)', calories: 140, unit: '330ml' },
  { name: '橙汁(一杯)', nameEn: 'Orange juice (1 cup)', calories: 110, unit: '250ml' },
  { name: '啤酒(一罐)', nameEn: 'Beer (1 can)', calories: 150, unit: '330ml' },

  // 零食
  { name: '巧克力(一块)', nameEn: 'Chocolate (1 bar)', calories: 230, unit: '45g' },
  { name: '薯片(一包)', nameEn: 'Chips (1 bag)', calories: 280, unit: '50g' },
  { name: '饼干(5片)', nameEn: 'Crackers (5)', calories: 150, unit: '30g' },
  { name: '坚果(一把)', nameEn: 'Nuts (1 handful)', calories: 170, unit: '30g' },
  { name: '冰淇淋(一球)', nameEn: 'Ice cream (1 scoop)', calories: 140, unit: '80g' },
  { name: '蛋糕(一块)', nameEn: 'Cake (1 slice)', calories: 350, unit: '100g' },

  // 快餐
  { name: '汉堡', nameEn: 'Hamburger', calories: 450, unit: '200g' },
  { name: '炸鸡(一块)', nameEn: 'Fried chicken (1 pc)', calories: 300, unit: '120g' },
  { name: '披萨(一片)', nameEn: 'Pizza (1 slice)', calories: 270, unit: '120g' },
  { name: '炒饭', nameEn: 'Fried rice', calories: 400, unit: '300g' },
  { name: '盖浇饭', nameEn: 'Rice with toppings', calories: 500, unit: '350g' },
  { name: '麻辣烫', nameEn: 'Malatang', calories: 450, unit: '400g' },
  { name: '火锅(人均)', nameEn: 'Hotpot (per person)', calories: 800, unit: '~500g' },
  { name: '煎饼果子', nameEn: 'Jianbing', calories: 350, unit: '200g' },
  { name: '方便面', nameEn: 'Instant noodles', calories: 450, unit: '100g' },

  // 垃圾食品（高热量对比）
  { name: '炸鸡腿(大)', nameEn: 'Fried chicken leg (L)', calories: 500, unit: '200g' },
  { name: '薯条(大份)', nameEn: 'French fries (large)', calories: 530, unit: '170g' },
  { name: '奶油蛋糕(一块)', nameEn: 'Cream cake (1 slice)', calories: 450, unit: '120g' },
  { name: '甜甜圈(一个)', nameEn: 'Donut (1)', calories: 300, unit: '75g' },
  { name: '珍珠奶茶(大杯)', nameEn: 'Bubble tea (large)', calories: 500, unit: '700ml' },
  { name: '炸鸡排', nameEn: 'Fried chicken cutlet', calories: 550, unit: '200g' },
  { name: '烤肠(一根)', nameEn: 'Grilled sausage (1)', calories: 280, unit: '100g' },
  { name: '可颂(一个)', nameEn: 'Croissant (1)', calories: 270, unit: '60g' },
  { name: '辣条(一包)', nameEn: 'Spicy strips (1 bag)', calories: 300, unit: '60g' },
  { name: '泡芙(一个)', nameEn: 'Cream puff (1)', calories: 250, unit: '80g' },
  { name: '关东煮(一份)', nameEn: 'Oden (1 serving)', calories: 350, unit: '300g' },
  { name: '炸酱面', nameEn: 'Zhajiang noodles', calories: 550, unit: '350g' },
  { name: '烧烤(人均)', nameEn: 'BBQ (per person)', calories: 900, unit: '~400g' },
  { name: '奶昔(一杯)', nameEn: 'Milkshake (1 cup)', calories: 450, unit: '400ml' },
  { name: '肥宅快乐水+薯片', nameEn: 'Cola + chips combo', calories: 420, unit: '~380ml+50g' },

  // 其他
  { name: '沙拉酱(一勺)', nameEn: 'Salad dressing (1 tbsp)', calories: 70, unit: '15g' },
  { name: '花生酱(一勺)', nameEn: 'Peanut butter (1 tbsp)', calories: 95, unit: '15g' },
  { name: '蜂蜜(一勺)', nameEn: 'Honey (1 tbsp)', calories: 65, unit: '20g' },
]
