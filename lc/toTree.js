// 我的数据结构格式如下
const a = [
    {
        "id": "Thu Dec 07 2023 22:13:16 GMT+0800 (中国标准时间)",
        "pid": -1,
        "srcTblDbIdData": {},
        "srcTblAlias": "",
        "srcTblChnNm": "",
        "name": {},
        "cmt": "",
        "name1": "",
        "isLateral": 6,
        "srcObjId": "",
        "_X_ROW_KEY": "row_173",
        "index": 0,
        "srcTblEngNm": "fsdf",
    },
    {
        "id": "Thu Dec 07 2023 22:14:17 GMT+0800 (中国标准时间)",
        "pid": 0,
        "srcTblDbIdData": {},
        "srcTblAlias": "",
        "srcTblChnNm": "",
        "name": {},
        "cmt": "",
        "name1": "",
        "isLateral": 6,
        "srcObjId": "",
        "_X_ROW_KEY": "row_174",
        "index": 1,
        "srcTblEngNm": "false55"
    },
    {
        "id": "Thu Dec 07 2023 22:17:02 GMT+0800 (中国标准时间)",
        "pid": 1,
        "srcTblDbIdData": {},
        "srcTblAlias": "",
        "srcTblChnNm": "",
        "name": {},
        "cmt": "",
        "name1": "",
        "isLateral": 6,
        "srcObjId": "",
        "_X_ROW_KEY": "row_175",
        "index": 2,
        "srcTblEngNm": "false78979789"
    }
]


// 我想要实现树形结构
const ac = [
    {   
        "children":[
            {   "children":[
                {
                    "id": "Thu Dec 07 2023 22:17:02 GMT+0800 (中国标准时间)",
                    "pid": 1,
                    "srcTblDbIdData": {},
                    "srcTblAlias": "",
                    "srcTblChnNm": "",
                    "name": {},
                    "cmt": "",
                    "name1": "",
                    "isLateral": 6,
                    "srcObjId": "",
                    "_X_ROW_KEY": "row_175",
                    "index": 2,
                    "srcTblEngNm": "false78979789"
                }
            ],
                "id": "Thu Dec 07 2023 22:14:17 GMT+0800 (中国标准时间)",
                "pid": 0,
                "srcTblDbIdData": {},
                "srcTblAlias": "",
                "srcTblChnNm": "",
                "name": {},
                "cmt": "",
                "name1": "",
                "isLateral": 6,
                "srcObjId": "",
                "_X_ROW_KEY": "row_174",
                "index": 1,
                "srcTblEngNm": "false55"
            },
            
        ],
        "id": "Thu Dec 07 2023 22:13:16 GMT+0800 (中国标准时间)",
        "pid": -1,
        "srcTblDbIdData": {},
        "srcTblAlias": "",
        "srcTblChnNm": "",
        "name": {},
        "cmt": "",
        "name1": "",
        "isLateral": 6,
        "srcObjId": "",
        "_X_ROW_KEY": "row_173",
        "index": 0,
        "srcTblEngNm": "fsdf",
    }
    
]

// 怎么使用数组转树的形式实现代码呢？
// 代码如下：
function toTree(data) {
    // 删除 所有 children,以防止多次调用
    data.forEach(function (item) {
        delete item.children;
    });
    // 将数据存储为 以 id 为 KEY 的 map 索引数据列
    var map = {};
    data.forEach(function (item) {
        map[item.id] = item;
    });
    var val = [];
    data.forEach(function (item) {
        // 以当前遍历项，的pid,去map对象中找到索引的id
        var parent = map[item.pid];
        // console.log(map[item.pid])
        // console.log(parent)
        // console.log(item)
        // console.log('-----------------')
        // console.log(parent)
        if (parent) {
            // console.log(parent.children)
            // console.log(item)
            (parent.children || (parent.children = [])).push(item);
        } else {
            val.push(item);
        }
    });
    return val;
}

