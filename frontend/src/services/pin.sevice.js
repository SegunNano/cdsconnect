import api from "./api";

export const resetPin = async(newPin, confirmPin) => {

    const res = await api.patch('/pin/reset', { newPin, confirmPin })
    return res.data
}