let isSyncing = false;

cron.schedule('*/15 * * * *', async () => {
    if (isSyncing) return;
    isSyncing = true;
    console.log("Starting vehicle sync...");
    try {
        const cache = await WordPressService.getAllVehicles();
        await WordPressService.syncVehiclesToSupabase(cache);
        console.log("Vehicle sync finished.");
    } catch (err) {
        console.error("Vehicle sync failed:", err);
    } finally {
        isSyncing = false;
    }
});
