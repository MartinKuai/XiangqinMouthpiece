function InviteCodeInput({ inviteCode, setInviteCode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        邀请码 <span className="text-gray-400">（可选）</span>
      </label>
      <input
        type="text"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="如有邀请码请填写"
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
      />
      <p className="mt-1 text-xs text-gray-500">仅用于演示保护；未设置邀请码时可留空。</p>
    </div>
  )
}

export default InviteCodeInput
