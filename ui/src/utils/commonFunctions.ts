import Swal from 'sweetalert2'

function parseGraphQLError (err: string): string {
    return err.split(': ')[err.split(': ').length - 1]
}

function deepCopy (obj: any) {
    return JSON.parse(JSON.stringify(obj))
}
function dateDisplay (zonedDate: any) {
    let date = new Date(zonedDate)
    // return date.toLocaleString('en-CA', { timeZone: 'UTC' })
    return date.toLocaleString('en-CA')
}
function genUuid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        let r = Math.random() * 16 | 0
        let v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

export type SwalData = {
    questionText: string
    successTitle: string,
    successText: string,
    dismissText: string
}

async function swalWrapper (wrappedFunction: Function, swalData: SwalData) {
    const swalResp = await Swal.fire({
        title: 'Are you sure?',
        text: swalData.questionText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes!',
        cancelButtonText: 'No!'
    })
    
    if (swalResp.value) {
        await wrappedFunction()
        Swal.fire(
            swalData.successTitle,
            swalData.successText,
            'success'
        )
    // For more information about handling dismissals please visit
    // https://sweetalert2.github.io/#handling-dismissals
    } else if (swalResp.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
            'Cancelled',
            swalData.dismissText,
            'error'
        )
    }
}

export default {
    deepCopy,
    parseGraphQLError,
    genUuid,
    dateDisplay,
    swalWrapper
}