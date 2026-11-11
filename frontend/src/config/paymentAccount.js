export const PAYMENT_ACCOUNT = {
    bankName: import.meta.env.VITE_PAY_BANK_NAME || '',
    accountNumber: import.meta.env.VITE_PAY_ACCOUNT_NUMBER || '',
    accountName: import.meta.env.VITE_PAY_ACCOUNT_NAME || ''
}
export const hasPaymentAccount = Boolean(PAYMENT_ACCOUNT.accountNumber && PAYMENT_ACCOUNT.accountName)