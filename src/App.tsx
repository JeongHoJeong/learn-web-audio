import * as React from 'react'

const AUDIO_CONSTRAINTS = {
  echoCancellation: false,
  noiseSuppression: false,
}

/* eslint-disable-next-line no-undef */
const useDevices = (kind: MediaDeviceKind) => {
  const [isNotAllowed, setIsNotAllowed] = React.useState<boolean>()
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>()

  const getDevices = React.useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
      })
      const infos = await navigator.mediaDevices.enumerateDevices()
      setDevices(infos.filter((info) => info.kind === kind))
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setIsNotAllowed(true)
      }
    }
  }, [kind])

  React.useEffect(() => {
    getDevices()
  }, [getDevices])

  return {
    devices,
    isNotAllowed,
  }
}

const AudioDeviceSelector = ({
  selectedId,
  onChange,
}: {
  selectedId?: string
  onChange(id: string): void
}) => {
  const { devices, isNotAllowed } = useDevices('audioinput')

  return (
    <div>
      <select
        onChange={(e) => onChange(e.currentTarget.value)}
        value={selectedId}
      >
        {devices?.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      {isNotAllowed && (
        <div>권한을 허용해주세요. 브라우저 설정에서 허용해 주셔야 합니다.</div>
      )}
    </div>
  )
}

export default function App() {
  const [deviceId, setDeviceId] = React.useState<string>()

  React.useEffect(() => {
    ;(async () => {
      if (deviceId) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            ...AUDIO_CONSTRAINTS,
            deviceId,
          },
        })

        // https://developers.google.com/web/updates/2012/09/Live-Web-Audio-Input-Enabled
        const context = new AudioContext()
        const mediaStreamSource = context.createMediaStreamSource(stream)
        mediaStreamSource.connect(context.destination)
      }
    })()
  }, [deviceId])

  return (
    <>
      <h1>Low Latency Monitor</h1>
      <div>
        <h2>기기 설정</h2>
        <AudioDeviceSelector selectedId={deviceId} onChange={setDeviceId} />
      </div>
    </>
  )
}
