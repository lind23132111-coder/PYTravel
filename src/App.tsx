import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { DeveloperDashboard } from './components/DeveloperDashboard'
import { ItineraryView } from './components/ItineraryView'
import { ExpensesView } from './components/ExpensesView'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { TripSelection } from './components/TripSelection'
import { ItineraryOverview } from './components/ItineraryOverview'
import { MapView } from './components/MapView'
import type { Trip, ItineraryItem } from './types/trip'
import { type Session } from '@supabase/supabase-js'

const MOCK_TRIPS: Trip[] = [
  { id: 'europe-2026', name: '中歐・德奧匈浪漫巡禮', owner_id: 'user1', start_date: '2026-08-30', end_date: '2026-09-12', theme_color: 'blue', created_at: new Date().toISOString() },
  { id: 'phuket-2026', name: '普吉島・海島奢華度假', owner_id: 'user1', start_date: '2026-10-15', end_date: '2026-10-21', theme_color: 'indigo', created_at: new Date().toISOString() }
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [session, setSession] = useState<Session | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([
    { id: 'd1-1', trip_id: 'europe-2026', dayId: "8/30", time: "11:30 PM", title: "【啟程】桃園機場起飛", location: "桃園國際機場 (TPE)", description: "✈️ 長榮 BR055。補眠。", transport: "飛機・13 小時", duration: "機上過夜" },
    { id: 'd2-1', trip_id: 'europe-2026', dayId: "8/31", time: "06:30 AM", title: "【抵達】維也納機場 (VIE)", location: "維也納國際機場", description: "抵達後辦理入境。", duration: "1.5 小時" },
    { id: 'd2-2', trip_id: 'europe-2026', dayId: "8/31", time: "08:00 AM", title: "搭車前往匈牙利", location: "維也納 -> 布達佩斯", description: "🚘 機場專車包車。", transport: "包車・2.5 小時", duration: "2.5 小時" },
    { id: 'd2-3', trip_id: 'europe-2026', dayId: "8/31", time: "11:30 AM", title: "入住布達佩斯飯店", location: "Anantara New York Palace", description: "🍽️ 下午紐約咖啡館下午茶。", duration: "入住休息" },
    { id: 'd3-1', trip_id: 'europe-2026', dayId: "9/01", time: "10:30 AM", title: "【佩斯區】國會大廈導覽", location: "匈牙利國會大廈", description: "需預約。", duration: "1.5 小時" },
    { id: 'd3-2', trip_id: 'europe-2026', dayId: "9/01", time: "01:00 PM", title: "多瑙河畔散步", description: "🍽️ 午餐：道地牛肉湯。", duration: "3 小時" },
    { id: 'd4-1', trip_id: 'europe-2026', dayId: "9/02", time: "09:30 AM", title: "【布達區】漁人堡 & 瑪麗亞教堂", location: "Fisherman's Bastion", description: "俯瞰多瑙河美景。", duration: "2.5 小時" },
    { id: 'd4-2', trip_id: 'europe-2026', dayId: "9/02", time: "01:00 PM", title: "布達城堡區逛遊", description: "歷史感十足的街道。", duration: "3 小時" },
    { id: 'd5-1', trip_id: 'europe-2026', dayId: "9/03", time: "10:00 AM", title: "英雄廣場 & 城市公園", location: "Heroes' Square", description: "壯闊的紀念碑。", duration: "2 小時" },
    { id: 'd5-2', trip_id: 'europe-2026', dayId: "9/03", time: "02:00 PM", title: "塞切尼溫泉體驗", location: "Széchenyi Thermal Bath", description: "最著名的歐式溫泉。", duration: "3 小時" },
    { id: 'd6-1', trip_id: 'europe-2026', dayId: "9/04", time: "09:00 AM", title: "中央市場買特產", location: "Great Market Hall", description: "採買紅椒粉與伴手禮。", duration: "2 小時" },
    { id: 'd6-2', trip_id: 'europe-2026', dayId: "9/04", time: "01:00 PM", title: "瓦茨街購物散步", description: "🍽️ 午餐：街邊美食。", duration: "3 小時" },
    { id: 'd7-1', trip_id: 'europe-2026', dayId: "9/05", time: "10:00 AM", title: "【出發】前往巴拉頓湖區", location: "布達佩斯 -> Balatonfüred", description: "準備度假。", transport: "國鐵・2 小時", duration: "2 小時" },
    { id: 'd7-2', trip_id: 'europe-2026', dayId: "9/05", time: "01:00 PM", title: "湖畔漫步與帆船巡禮", location: "Lake Balaton", description: "匈牙利的海。", duration: "4 小時" },
    { id: 'd8-1', trip_id: 'europe-2026', dayId: "9/06", time: "10:00 AM", title: "蒂豪尼半島(Tihany)", location: "Tihany Abbey", description: "絕美湖景修道院。", duration: "3 小時" },
    { id: 'd8-2', trip_id: 'europe-2026', dayId: "9/06", time: "02:00 PM", title: "薰衣草田與特色小鋪", description: "放鬆心情。", duration: "2 小時" },
    { id: 'd9-1', trip_id: 'europe-2026', dayId: "9/07", time: "11:00 AM", title: "湖畔慢活：閱讀與下午茶", description: "充飽電再出發。", duration: "全天" },
    { id: 'd10-1', trip_id: 'europe-2026', dayId: "9/08", time: "10:30 AM", title: "【出發】前往維也納", location: "Budapest -> Wien Hbf", description: "搭乘 Railjet。", transport: "Railjet・2.5 小時", duration: "2.5 小時" },
    { id: 'd10-2', trip_id: 'europe-2026', dayId: "9/08", time: "01:30 PM", title: "入住維也納飯店", location: "Hotel Sacher", description: "🍰 必吃薩赫蛋糕。", duration: "入住休息" },
    { id: 'd11-1', trip_id: 'europe-2026', dayId: "9/09", time: "09:30 AM", title: "【經典】美泉宮宮殿導覽", location: "Schönbrunn Palace", description: "哈布斯堡夏宮。", duration: "3 小時" },
    { id: 'd11-2', trip_id: 'europe-2026', dayId: "9/09", time: "02:00 PM", title: "聖史蒂芬大教堂區", location: "Stephansdom", description: "格拉本大街逛街。", duration: "3 小時" },
    { id: 'd12-1', trip_id: 'europe-2026', dayId: "9/10", time: "10:30 AM", title: "【文化】藝術與美景巡禮", location: "美景宮 / 藝術史博物館", description: "藝術巡禮。", duration: "3 小時" },
    { id: 'd12-2', trip_id: 'europe-2026', dayId: "9/10", time: "02:30 PM", title: "納許市場美食探索", location: "Naschmarkt", description: "🍽️ 異國料理大集合。", duration: "2 小時" },
    { id: 'd13-1', trip_id: 'europe-2026', dayId: "9/11", time: "10:00 AM", title: "普拉特樂園遊玩", location: "Prater", description: "百年摩天輪看景。", duration: "3 小時" },
    { id: 'd13-2', trip_id: 'europe-2026', dayId: "9/11", time: "06:00 PM", title: "維也納歌劇院饗宴", location: "Vienna State Opera", description: "體驗世界級演出。", duration: "3 小時" },
    { id: 'd14-1', trip_id: 'europe-2026', dayId: "9/12", time: "11:00 AM", title: "最後採買與慢活維也納", description: "收拾心情準備賦歸。", duration: "4 小時" },
    { id: 'd14-2', trip_id: 'europe-2026', dayId: "9/12", time: "04:30 PM", title: "前往機場準備報到", transport: "🚕 專車接送", duration: "3 小時" },

    { id: 'p-1017-1', trip_id: 'phuket-2026', dayId: "10/17", time: "04:15 PM", title: "台北起飛", description: "✈️ 台北桃園 (TPE) 啟程", duration: "3.5 小時" },
    { id: 'p-1017-2', trip_id: 'phuket-2026', dayId: "10/17", time: "07:50 PM", title: "抵達普吉 (HKT)", location: "Phuket International Airport", description: "辦理入境。", duration: "1 小時" },
    { id: 'p-1017-3', trip_id: 'phuket-2026', dayId: "10/17", time: "09:00 PM", title: "入住邁考萬豪聽課房", location: "Marriott Mai Khao", transport: "🚕 機場專車", description: "🍽️ 建議客房送餐，讓孩子盡快休息。", duration: "入住" },
    { id: 'p-1018-1', trip_id: 'phuket-2026', dayId: "10/18", time: "09:00 AM", title: "抵達大象營", location: "Elephant Sanctuary", transport: "🚐 私人包車", duration: "4 小時", description: "🐘 餵食與大象洗澡。" },
    { id: 'p-1018-2', trip_id: 'phuket-2026', dayId: "10/18", time: "01:00 PM", title: "結束體驗返回飯店", description: "🍽️ 園區泰式自助餐。", duration: "2 小時" },
    { id: 'p-1018-3', trip_id: 'phuket-2026', dayId: "10/18", time: "03:00 PM", title: "飯店泳池戲水", description: "⚠️ 注意防蚊與防曬。下午放電行程。", duration: "2 小時" },
    { id: 'p-1019-1', trip_id: 'phuket-2026', dayId: "10/19", time: "10:00 AM", title: "悠閒早午餐時光", transport: "🚶 步行為主", description: "🍽️ 優質酸種麵包與泰式奶茶。", duration: "3 小時" },
    { id: 'p-1019-2', trip_id: 'phuket-2026', dayId: "10/19", time: "01:00 PM", title: "萬豪聽課說明會", description: "⚠️ 孩子可安排在 Kids Club。", duration: "2 小時" },
    { id: 'p-1019-3', trip_id: 'phuket-2026', dayId: "10/19", time: "03:30 PM", title: "結束後回房休息", duration: "隨性" },
    { id: 'p-1020-1', trip_id: 'phuket-2026', dayId: "10/20", time: "11:00 AM", title: "萬豪退房，包車南下", transport: "🚐 私人包車", duration: "2 小時" },
    { id: 'p-1020-2', trip_id: 'phuket-2026', dayId: "10/20", time: "01:00 PM", title: "普吉老鎮文青散步", location: "Phuket Old Town", description: "🍽️ 下午茶：老宅改建咖啡廳。", duration: "3 小時" },
    { id: 'p-1020-3', trip_id: 'phuket-2026', dayId: "10/20", time: "04:00 PM", title: "入住南邊飯店", description: "全家放鬆。", duration: "入住" },
    { id: 'p-1021-1', trip_id: 'phuket-2026', dayId: "10/21", time: "11:00 AM", title: "抵達 Central Phuket 商場", transport: "🚕 Grab", duration: "0.5 小時" },
    { id: 'p-1021-2', trip_id: 'phuket-2026', dayId: "10/21", time: "11:30 AM", title: "Aquaria Phuket 水族館", description: "🐟 全泰最大！完美室內備案。", duration: "4 小時" },
    { id: 'p-1022-1', trip_id: 'phuket-2026', dayId: "10/22", time: "11:00 AM", title: "飯店內享受設施", transport: "🚕 Grab", duration: "4 小時" },
    { id: 'p-1022-2', trip_id: 'phuket-2026', dayId: "10/22", time: "03:00 PM", title: "熱門海景觀景台或餐廳", description: "🍽️ 晚餐：Three Monkeys。", duration: "3 小時" },
    { id: 'p-1023-1', trip_id: 'phuket-2026', dayId: "10/23", time: "09:00 AM", title: "睡到自然醒，隨性安排", transport: "🚕 Grab", duration: "全天" },
    { id: 'p-1023-2', trip_id: 'phuket-2026', dayId: "10/23", time: "06:00 PM", title: "大型超市買伴手禮", description: "🍽️ 晚餐：道地海鮮餐廳。", duration: "2 小時" },
    { id: 'p-1024-1', trip_id: 'phuket-2026', dayId: "10/24", time: "12:00 PM", title: "退房，吃頓豐盛午餐", transport: "🚕 預約機場專車", duration: "5 小時" },
    { id: 'p-1024-2', trip_id: 'phuket-2026', dayId: "10/24", time: "05:30 PM", title: "抵達普吉機場", description: "準備回程。", duration: "3 小時" },
    { id: 'p-1024-3', trip_id: 'phuket-2026', dayId: "10/24", time: "08:40 PM", title: "搭乘 IT504 班機起飛", description: "✈️ 凌晨抵達台北。", duration: "紅眼航班" }
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Local development bypass if no Supabase configured
  // TEMPORARY BYPASS FOR VISUAL TESTING
  const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const handleGuestMode = () => {
    setSession({
      user: { id: 'guest-user', email: 'guest@example.com' } as any,
      access_token: 'dummy',
      refresh_token: 'dummy',
      expires_in: 3600,
      token_type: 'bearer'
    } as Session);
  };

  if (!session && isSupabaseConfigured) {
    return <Auth />
  }

  if (!session && !isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 mb-8 animate-bounce">
          <span className="text-2xl font-black">PY</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">歡迎使用 PYTravel 行程助手</h1>
        <p className="text-slate-400 max-w-sm mb-10 font-medium">您可以透過「預覽模式」直接查看我們為您準備的普吉島與中歐示範行程。</p>
        <button
          onClick={handleGuestMode}
          className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
        >
          進入預覽模式
        </button>
      </div>
    );
  }

  if (session && !activeTrip) {
    return (
      <TripSelection
        trips={MOCK_TRIPS}
        onSelect={(trip) => setActiveTrip(trip)}
        onNewTrip={() => alert('New trip feature coming soon!')}
      />
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSwitchTrip={() => setActiveTrip(null)}
      user={session?.user}
    >
      {activeTab === 'itinerary' && (
        <ItineraryView
          key={activeTrip?.id}
          activeTrip={activeTrip}
          onTripChange={(trip) => setActiveTrip(trip)}
          items={items}
          onItemsChange={setItems}
        />
      )}
      {activeTab === 'overview' && (
        <ItineraryOverview
          items={items}
          activeTrip={activeTrip}
        />
      )}
      {activeTab === 'map' && <MapView items={items} activeTrip={activeTrip} />}
      {activeTab === 'expenses' && <ExpensesView activeTrip={activeTrip} />}
      {activeTab !== 'itinerary' && activeTab !== 'expenses' && activeTab !== 'map' && activeTab !== 'overview' && (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
          <p className="text-sm font-medium">Coming Soon</p>
        </div>
      )}
      <DeveloperDashboard />
    </Layout>
  )
}

export default App
