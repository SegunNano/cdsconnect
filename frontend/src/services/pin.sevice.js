import api from "./api";

export const resetPin = async (currentPin, newPin, confirmPin) => {
    const res = await api.patch('/pin/reset', { currentPin, newPin, confirmPin })
    return res.data
}