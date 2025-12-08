// stock-manager.js
class StockManager {
    constructor(db) {
        this.db = db;
    }
    
    async updateStockOnOrder(orderId, items) {
        const batch = this.db.batch();
        const stockUpdates = [];
        
        for (const item of items) {
            const productRef = this.db.collection('products').doc(item.id);
            const productDoc = await productRef.get();
            
            if (!productDoc.exists) {
                console.warn(`Producto ${item.id} no encontrado`);
                continue;
            }
            
            const productData = productDoc.data();
            const currentStock = Number(productData.stock) || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            batch.update(productRef, {
                stock: newStock,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastOrderId: orderId
            });
            
            stockUpdates.push({
                productId: item.id,
                productName: item.name,
                previousStock: currentStock,
                newStock: newStock,
                quantity: item.quantity,
                orderId: orderId,
                timestamp: new Date().toISOString()
            });
        }
        
        // Guardar historial de cambios de stock
        const stockLogRef = this.db.collection('stockLogs').doc();
        batch.set(stockLogRef, {
            orderId: orderId,
            updates: stockUpdates,
            timestamp: new Date().toISOString(),
            type: 'order_processed'
        });
        
        await batch.commit();
        return stockUpdates;
    }
    
    async restoreStockOnCancel(orderId, items) {
        const batch = this.db.batch();
        
        for (const item of items) {
            const productRef = this.db.collection('products').doc(item.id);
            const productDoc = await productRef.get();
            
            if (productDoc.exists) {
                const productData = productDoc.data();
                const currentStock = Number(productData.stock) || 0;
                const restoredStock = currentStock + item.quantity;
                
                batch.update(productRef, {
                    stock: restoredStock,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastCancellation: new Date().toISOString()
                });
            }
        }
        
        await batch.commit();
    }
    
    async getLowStockProducts(threshold = 5) {
        const snapshot = await this.db.collection('products')
            .where('stock', '<=', threshold)
            .where('stock', '>', 0)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

// Uso:
// window.stockManager = new StockManager(window.db);