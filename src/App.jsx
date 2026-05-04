import { useState, useEffect, useCallback } from 'react'
import './App.css'

const KEYBOARD_LAYOUT = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift↑'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl', '←', '↑', '↓', '→'],
]

const KEYBOARD_LAYOUT_AZERTY = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['²', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '°', 'Backspace'],
  ['Tab', 'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '^', '$', 'Enter'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'Enter'],
  ['Shift', 'W', 'X', 'C', 'V', 'B', 'N', ',', '.', '/', 'Shift↑'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'AltGr', 'Ctrl', '←', '↑', '↓', '→'],
]

const KEY_WIDTHS = {
  'Backspace': 2, '\\': 2, 'Enter': 2, 'Shift↑': 2,
  'Shift': 2.5, 'Ctrl': 2, 'Win': 1.5, 'Alt': 1.5,
  'Space': 6.5, 'Alt': 1.5, 'Fn': 1, '←': 1, '↑': 1, '↓': 1, '→': 1,
}

function getKeyWidth(key) {
  if (KEY_WIDTHS[key]) return KEY_WIDTHS[key]
  if (key.length > 1 && !['Esc', 'Tab', 'Caps', 'Enter', 'Space'].includes(key)) return 1.5
  return 1
}

function App() {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [inputChars, setInputChars] = useState([])
  const [isActive, setIsActive] = useState(false)
  const [layout, setLayout] = useState('QWERTY')
  const keyboardLayout = layout === 'AZERTY' ? KEYBOARD_LAYOUT_AZERTY : KEYBOARD_LAYOUT

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault()
      setIsActive(true)
      setPressedKeys(prev => new Set([...prev, e.code]))
      if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        const char = e.key.length === 1 ? e.key : `[${e.code}]`
        setInputChars(prev => [...prev.slice(-49), char])
      }
    }

    const handleKeyUp = (e) => {
      setPressedKeys(prev => {
        const next = new Set(prev)
        next.delete(e.code)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    setIsActive(true)
    const key = e.target.dataset.key
    if (key) {
      setPressedKeys(prev => new Set([...prev, `Key${key}`]))
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const key = e.target.dataset.key
    if (key) {
      setPressedKeys(prev => {
        const next = new Set(prev)
        next.delete(`Key${key}`)
        return next
      })
    }
  }, [])

  const clearInput = () => {
    setInputChars([])
    setPressedKeys(new Set())
  }

  return (
    <div className="app">
      <header className="header">
        <h1>⌨️ KeyScope</h1>
        <p className="subtitle">在线键盘测试工具</p>
        <div className="layout-toggle">
          <label>键盘布局：</label>
          <select value={layout} onChange={e => setLayout(e.target.value)}>
            <option value="QWERTY">QWERTY (美式)</option>
            <option value="AZERTY">AZERTY (法式)</option>
          </select>
        </div>
      </header>

      <main className="main">
        <div className={`keyboard-container ${isActive ? 'active' : ''}`} onClick={() => setIsActive(true)}>
          {!isActive && (
            <div className="overlay">
              <span>👉 请点击此处，然后按下键盘任意键开始测试</span>
            </div>
          )}
          <div className="keyboard">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {row.map((key) => {
                  const code = keyToCode(key)
                  const pressed = [...pressedKeys].some(pk => {
                    const pkBase = pk.replace('Left', '').replace('Right', '')
                    return pkBase === code || pkBase.includes(key) || key === pk
                  })
                  const width = getKeyWidth(key)
                  return (
                    <div
                      key={key}
                      data-key={key}
                      className={`key ${pressed ? 'pressed' : ''} ${width > 1 ? 'wide' : ''}`}
                      style={{ '--key-width': width }}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    >
                      <span className="key-label">{key}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="info-panel">
          <div className="pressed-keys-display">
            <h3>按键检测</h3>
            <div className="pressed-list">
              {pressedKeys.size === 0 ? (
                <span className="empty-hint">按下键盘查看结果</span>
              ) : (
                [...pressedKeys].map(pk => (
                  <span key={pk} className="key-tag">{pk}</span>
                ))
              )}
            </div>
            {pressedKeys.size > 1 && (
              <p className="nkro-hint">✅ 多键同时检测正常 ({pressedKeys.size}键)</p>
            )}
          </div>

          <div className="input-display">
            <div className="input-header">
              <h3>输入显示</h3>
              <button className="clear-btn" onClick={clearInput}>清除</button>
            </div>
            <div className="input-text">
              {inputChars.length === 0 ? (
                <span className="empty-hint">在此显示输入的字符</span>
              ) : (
                inputChars.join('')
              )}
            </div>
          </div>

          <div className="instructions">
            <h3>使用说明</h3>
            <ul>
              <li>点击页面任意位置激活测试</li>
              <li>按下键盘按键查看高亮显示</li>
              <li>同时按下多个键可测试按键冲突（NKRO）</li>
              <li>移动端支持触屏点击测试</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>KeyScope - 免费在线键盘测试工具 | <a href="https://github.com/diep98snhungrzzqubw4-afk/keyboard-tester" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  )
}

function keyToCode(key) {
  const map = {
    'Esc': 'Escape', 'Tab': 'Tab', 'Caps': 'CapsLock', 'Enter': 'Enter',
    'Backspace': 'Backspace', 'Shift': 'Shift', 'Ctrl': 'Control',
    'Win': 'Meta', 'Alt': 'Alt', 'Space': 'Space',
    '←': 'ArrowLeft', '↑': 'ArrowUp', '↓': 'ArrowDown', '→': 'ArrowRight',
  }
  if (map[key]) return map[key]
  if (key.length === 1) return `Key${key.toUpperCase()}`
  return key
}

export default App
