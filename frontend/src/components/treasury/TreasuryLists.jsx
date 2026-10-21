import { TrendingUp, TrendingDown, Coins, Filter, ChevronDown } from 'lucide-react'

export function TransactionRow({ icon, iconBg, title, subtitle, amount, amountColor }) {
    return (
        <div style={{
            background: '#ffffff', borderRadius: '12px',
            padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '12px'
        }}>
            <div style={{
                width: '40px', height: '40px', background: iconBg,
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12',
                    marginBottom: '2px', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                    {title}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>{subtitle}</div>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: amountColor, flexShrink: 0 }}>
                {amount}
            </div>
        </div>
    )
}

export function DateFilter({ tab, dateFilters, setDateFilters, setVisibleCounts, pageSize }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '12px'
        }}>
            <Filter size={14} color="#8fa396" />
            <input
                type="date"
                value={dateFilters[tab]}
                onChange={e => {
                    setDateFilters(prev => ({ ...prev, [tab]: e.target.value }))
                    setVisibleCounts(prev => ({ ...prev, [tab]: pageSize }))
                }}
                style={{
                    flex: 1, background: '#ffffff', border: '1px solid #e8ece9',
                    borderRadius: '10px', padding: '8px 12px',
                    fontSize: '0.82rem', color: '#0d1b12', outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
            />
            {dateFilters[tab] && (
                <button
                    onClick={() => setDateFilters(prev => ({ ...prev, [tab]: '' }))}
                    style={{
                        background: '#f2f4f7', border: 'none', borderRadius: '8px',
                        padding: '8px 10px', cursor: 'pointer', fontSize: '0.72rem',
                        fontWeight: 600, color: '#4a5e52',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    Clear
                </button>
            )}
        </div>
    )
}

export function LoadMoreButton({ tab, visible, total, onLoadMore }) {
    if (visible >= total) return null
    return (
        <button
            onClick={() => onLoadMore(tab)}
            style={{
                width: '100%', background: '#ffffff',
                border: '1px solid #e8ece9', borderRadius: '12px',
                padding: '11px', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '6px',
                fontSize: '0.78rem', fontWeight: 600, color: '#4a5e52',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginTop: '8px'
            }}
        >
            <ChevronDown size={14} color="#4a5e52" />
            Load more ({total - visible} remaining)
        </button>
    )
}

export function EmptyState({ message }) {
    return (
        <div style={{
            background: '#ffffff', borderRadius: '14px',
            padding: '24px', textAlign: 'center',
            color: '#8fa396', fontSize: '0.82rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            {message}
        </div>
    )
}

export function TabContentRenderer({
    activeTab,
    summary,
    dateFilters,
    setDateFilters,
    visibleCounts,
    setVisibleCounts,
    pageSize,
    loadMore
}) {
    const filterByDate = (list, dateKey, dateField) => {
        if (!dateKey) return list
        return list.filter(item => {
            const itemDate = new Date(item[dateField]).toLocaleDateString('en-CA')
            return itemDate === dateKey
        })
    }

    const filteredTopups = summary ? filterByDate(summary.topups, dateFilters.tokens, 'created_at') : []
    const filteredIncome = summary ? filterByDate(summary.external_income_list, dateFilters.income, 'created_at') : []
    const filteredExpenses = summary ? filterByDate(summary.expenses, dateFilters.expenses, 'created_at') : []

    const visibleTopups = filteredTopups.slice(0, visibleCounts.tokens)
    const visibleIncome = filteredIncome.slice(0, visibleCounts.income)
    const visibleExpenses = filteredExpenses.slice(0, visibleCounts.expenses)

    if (activeTab === 'general') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                    ...summary.topups.slice(0, 3).map(t => ({ ...t, _type: 'topup' })),
                    ...(summary.external_income_list || []).slice(0, 2).map(i => ({ ...i, _type: 'income' })),
                    ...summary.expenses.slice(0, 3).map(e => ({ ...e, _type: 'expense' }))
                ]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 8)
                    .map((item, i) => {
                        if (item._type === 'topup') return (
                            <TransactionRow key={`t${i}`}
                                icon={<TrendingUp size={18} color="#008751" />}
                                iconBg="#e6f4ee"
                                title={`${item.member_first_name || ''} ${item.member_last_name || ''} — Top Up`}
                                subtitle={new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                amount={`+₦${item.naira_value.toLocaleString()}`}
                                amountColor="#008751"
                            />
                        )
                        if (item._type === 'income') return (
                            <TransactionRow key={`i${i}`}
                                icon={<TrendingUp size={18} color="#4f46e5" />}
                                iconBg="#eef2ff"
                                title={item.description}
                                subtitle={`${item.source} · ${new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                amount={`+₦${item.amount_naira.toLocaleString()}`}
                                amountColor="#4f46e5"
                            />
                        )
                        return (
                            <TransactionRow key={`e${i}`}
                                icon={<TrendingDown size={18} color="#e53e3e" />}
                                iconBg="#fff0f0"
                                title={item.description}
                                subtitle={new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                amount={`-₦${item.amount_naira.toLocaleString()}`}
                                amountColor="#e53e3e"
                            />
                        )
                    })}
            </div>
        )
    }

    if (activeTab === 'tokens') {
        return (
            <>
                <DateFilter tab="tokens" dateFilters={dateFilters} setDateFilters={setDateFilters} setVisibleCounts={setVisibleCounts} pageSize={pageSize} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visibleTopups.length === 0
                        ? <EmptyState message={dateFilters.tokens ? 'No token transactions on this date' : 'No token transactions yet'} />
                        : visibleTopups.map((t, i) => (
                            <TransactionRow key={i}
                                icon={<Coins size={18} color="#008751" />}
                                iconBg="#e6f4ee"
                                title={`${t.member_first_name || ''} ${t.member_last_name || ''}`}
                                subtitle={`${t.state_code || ''} · ${new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                amount={`+₦${t.naira_value.toLocaleString()}`}
                                amountColor="#008751"
                            />
                        ))
                    }
                </div>
                <LoadMoreButton tab="tokens" visible={visibleCounts.tokens} total={filteredTopups.length} onLoadMore={loadMore} />
            </>
        )
    }

    if (activeTab === 'income') {
        return (
            <>
                <DateFilter tab="income" dateFilters={dateFilters} setDateFilters={setDateFilters} setVisibleCounts={setVisibleCounts} pageSize={pageSize} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visibleIncome.length === 0
                        ? <EmptyState message={dateFilters.income ? 'No income on this date' : 'No external income recorded yet'} />
                        : visibleIncome.map((item, i) => (
                            <TransactionRow key={i}
                                icon={<TrendingUp size={18} color="#4f46e5" />}
                                iconBg="#eef2ff"
                                title={item.description}
                                subtitle={`From ${item.source} · ${new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                amount={`+₦${item.amount_naira.toLocaleString()}`}
                                amountColor="#4f46e5"
                            />
                        ))
                    }
                </div>
                <LoadMoreButton tab="income" visible={visibleCounts.income} total={filteredIncome.length} onLoadMore={loadMore} />
            </>
        )
    }

    if (activeTab === 'expenses') {
        return (
            <>
                <DateFilter tab="expenses" dateFilters={dateFilters} setDateFilters={setDateFilters} setVisibleCounts={setVisibleCounts} pageSize={pageSize} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visibleExpenses.length === 0
                        ? <EmptyState message={dateFilters.expenses ? 'No expenses on this date' : 'No expenses logged yet'} />
                        : visibleExpenses.map((item, i) => (
                            <TransactionRow key={i}
                                icon={<TrendingDown size={18} color="#e53e3e" />}
                                iconBg="#fff0f0"
                                title={item.description}
                                subtitle={`By ${item.first_name} ${item.last_name} · ${new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                amount={`-₦${item.amount_naira.toLocaleString()}`}
                                amountColor="#e53e3e"
                            />
                        ))
                    }
                </div>
                <LoadMoreButton tab="expenses" visible={visibleCounts.expenses} total={filteredExpenses.length} onLoadMore={loadMore} />
            </>
        )
    }

    return null
}