PENDING_EVENT = lambda id: {
    "json": {
        'mid': id,
        'data': {},
        'status': "pending",
        'type': "meshUpdate",
    },
    "type": "notify", 
}