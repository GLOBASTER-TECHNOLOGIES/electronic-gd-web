export default function AdminHeader({ activeTab }: { activeTab: string }) {
    const titles: Record<string, string> = {
        'dashboard': 'Dashboard Overview',
        'create-officer': 'Register Personnel',
        'officers': 'Officer Records'
    };

    return (
        <header className="bg-white shadow-sm p-6 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-gray-800">
                {titles[activeTab] || 'Admin Panel'}
            </h2>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">System Admin</p>
                    <p className="text-xs text-gray-500">Superuser Access</p>
                </div>
            </div>
        </header>
    );
}