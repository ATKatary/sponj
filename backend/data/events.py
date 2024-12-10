PENDING_EVENT = lambda nid: {
    "json": {
        'nid': nid,
        'data': {},
        'status': "pending",
        'type': "nodeUpdate",
    },
    "type": "notify", 
}