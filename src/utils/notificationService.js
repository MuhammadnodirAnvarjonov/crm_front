import { createApp } from 'vue'
import Notification from '@/components/Notification.vue'

export function notify({ type = 'info', variant = 'default', message = '', meta = '', duration = 2000, keepAliveOnHover = true, position = 'top-right', onClick = null }) {
    // Notification konteynerini olish
    const container = document.getElementById('notifications') || document.body

    // Vue ilova yaratish
    const app = createApp(Notification, {
        type,
        variant,
        message,
        meta,
        duration,
        keepAliveOnHover,
        position,
        onClick,
    })

    // DOMga qo'shish
    const mountNode = document.createElement('div')
    container.appendChild(mountNode)

    const instance = app.mount(mountNode)

    // Yopilgandan so'ng DOMni tozalash
    instance.$watch('visible', (val) => {
        if (!val) {
            setTimeout(() => {
                app.unmount()
                mountNode.remove()
            }, 300)
        }
    })

    return instance
}
