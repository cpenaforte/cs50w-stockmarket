from datetime import datetime, timedelta

def populate_summary(period_type, current_user):
    period_range = 30
    period_step = 1
    if period_type == "week":
        period_range = 7
    elif period_type == "year":
        period_range = 365
        period_step = 7
    elif period_type == "ten_years":
        period_range = 3650
        period_step = 30
    
    summary = []
    
    for user_stock in current_user.user_stocks.all():
        stock = user_stock.stock
        
        operations = []
        for sub_user_stock in stock.user_stocks.all():
            for item in sub_user_stock.offers.all():
                try:
                    operation = item.operation
                    operations.append(operation)
                except:
                    continue
            
        operations.sort(key=lambda x: x.date, reverse=False)
                
        last_operations = []
        try:
            for i in reversed(range(0,period_range, period_step)):
                day = {
                    "date": (datetime.now().date() - timedelta(days=i)),
                    "operation": None,
                    "user_total_quantity": 0,
                }
                
                user_total_quantity = 0
                try:
                    for operation in operations:
                        if operation.buyer == current_user and operation.date.date() <= (datetime.now().date() - timedelta(days=i)):
                            user_total_quantity += operation.offer.quantity
                    
                    offers = [offer for offer in list(stock.offers.all()) if offer.date.date() <= (datetime.now().date() - timedelta(days=i))]
                    
                    for offer in offers:
                        if offer.user_stock.stock.id == stock.id and offer.done:
                            user_total_quantity -= offer.quantity
                            
                except:
                    pass
                
                day["user_total_quantity"] = user_total_quantity
                
                last_operation = None
                try:
                    last_operation = list((x for x in operations if x.date.date() == (datetime.now().date() - timedelta(days=i))))[-1]
                except:
                    last_operations.append(day)
                    continue
                    
                
                if last_operation != None:
                    day["operation"] = last_operation
                    last_operations.append(day)
        except:
            pass
        
        serialized_last_operations = [ { "date": x["date"], "operation": x["operation"].serialize() if x["operation"] else None, "user_total_quantity": x["user_total_quantity"] } for x in last_operations ] if last_operations else []
        
        single_summary = {
            "stock": stock.serialize(),
            "last_operations": serialized_last_operations,
        }
        
        summary.append(single_summary)
    
    return summary