async function sleepForTime(timeMs: number) {
    return new Promise((resolve, reject) => {
        setTimeout((() => {
            resolve(true)
        }), timeMs)
    })
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

export default {
    sleep: sleepForTime,
    uuidv4: uuidv4
}