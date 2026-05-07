import { useState } from 'react';
import { useAppStore, type Oshi, type Anniversary } from '../store';
import { Plus, Trash2, Youtube, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export function FanSettings() {
  const oshiList = useAppStore((s) => s.oshiList);
  const addOshi = useAppStore((s) => s.addOshi);
  const removeOshi = useAppStore((s) => s.removeOshi);
  const anniversaries = useAppStore((s) => s.anniversaries);
  const addAnniversary = useAppStore((s) => s.addAnniversary);
  const removeAnniversary = useAppStore((s) => s.removeAnniversary);
  const navigate = useNavigate();

  const [newNickname, setNewNickname] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newAnniDate, setNewAnniDate] = useState('');
  const [newAnniLabel, setNewAnniLabel] = useState('');
  const [channelTouched, setChannelTouched] = useState(false);

  const isChannelValid = newChannel.trim() === '' || newChannel.startsWith('https://www.youtube.com/@');

  const handleAddOshi = () => {
    if (!newNickname.trim() || !newChannel.trim()) return;
    const oshi: Oshi = {
      id: crypto.randomUUID(),
      nickname: newNickname.trim(),
      youtubeChannel: newChannel.trim(),
    };
    addOshi(oshi);
    setNewNickname('');
    setNewChannel('');
    toast.success(`${oshi.nickname}さんを登録しました`);
  };

  const handleAddAnniversary = () => {
    if (!newAnniDate || !newAnniLabel.trim()) return;
    const [, mm, dd] = newAnniDate.split('-');
    const anni: Anniversary = {
      id: crypto.randomUUID(),
      date: `${mm}-${dd}`,
      label: newAnniLabel.trim(),
    };
    addAnniversary(anni);
    setNewAnniDate('');
    setNewAnniLabel('');
    toast.success('記念日を登録しました');
  };

  return (
    <div className="max-w-lg mx-auto space-y-10">
      {/* Oshi Registration */}
      <section className="space-y-4">
        <h2 className="text-sky-900">推しの登録</h2>
        <div className="space-y-3">
          <label htmlFor="oshi-nickname" className="sr-only">ニックネーム</label>
          <input
            id="oshi-nickname"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder="ニックネーム"
            className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:border-sky-400 focus:outline-none"
          />
          <div className="relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
            <label htmlFor="oshi-channel" className="sr-only">YouTubeチャンネルURL</label>
            <input
              id="oshi-channel"
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
              onBlur={() => setChannelTouched(true)}
              placeholder="YouTubeチャンネルURL"
              className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white focus:outline-none ${
                channelTouched && !isChannelValid ? 'border-red-300 focus:border-red-400' : 'border-sky-200 focus:border-sky-400'
              }`}
            />
            <button
              type="button"
              onClick={() => window.open('https://www.youtube.com/feed/channels', '_blank', 'noopener,noreferrer')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300 hover:text-sky-500 transition-colors"
              title="登録チャンネルを表示する"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
          {channelTouched && !isChannelValid && (
            <p className="text-red-400" style={{ fontSize: '0.8rem' }}>
              「https://www.youtube.com/@」から始まるURLを入力してください
            </p>
          )}
          <button
            onClick={handleAddOshi}
            disabled={!newNickname.trim() || !newChannel.trim() || !isChannelValid}
            className="w-full py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> 登録する
          </button>
        </div>

        {oshiList.length > 0 && (
          <div className="space-y-2">
            {oshiList.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4 rounded-xl border border-sky-100 bg-white">
                <div>
                  <p className="text-sky-800">{o.nickname}</p>
                  <p className="text-sky-400/60" style={{ fontSize: '0.8rem' }}>{o.youtubeChannel}</p>
                </div>
                <button onClick={() => removeOshi(o.id)} className="p-2 text-red-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Anniversary */}
      <section className="space-y-4">
        <h2 className="text-sky-900">記念日の登録</h2>
        <p className="text-sky-600/60" style={{ fontSize: '0.85rem' }}>
          記念日には特別な淡い水色の折り紙が届きます。
        </p>
        <div className="space-y-3">
          <label htmlFor="anni-date" className="sr-only">記念日の日付</label>
          <input
            id="anni-date"
            type="date"
            value={newAnniDate}
            onChange={(e) => setNewAnniDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:border-sky-400 focus:outline-none"
          />
          <label htmlFor="anni-label" className="sr-only">記念日の名前</label>
          <input
            id="anni-label"
            value={newAnniLabel}
            onChange={(e) => setNewAnniLabel(e.target.value)}
            placeholder="記念日の名前（例: 活動開始日）"
            className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:border-sky-400 focus:outline-none"
          />
          <button
            onClick={handleAddAnniversary}
            disabled={!newAnniDate || !newAnniLabel.trim()}
            className="w-full py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> 記念日を登録
          </button>
        </div>

        {anniversaries.length > 0 && (
          <div className="space-y-2">
            {anniversaries.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-sky-100 bg-white">
                <div>
                  <p className="text-sky-800">{a.label}</p>
                  <p className="text-sky-400/60" style={{ fontSize: '0.8rem' }}>毎年 {a.date.replace('-', '月')}日</p>
                </div>
                <button onClick={() => removeAnniversary(a.id)} className="p-2 text-red-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Navigate to Home */}
      <div className="pt-6 flex justify-center">
        <button
          onClick={() => navigate('/fan')}
          disabled={oshiList.length === 0}
          className="px-8 py-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          紙飛行機を飛ばしに行く
        </button>
      </div>
    </div>
  );
}