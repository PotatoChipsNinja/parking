# 停车位数据库-小程序中间件
## 接口描述
接口请求域名：
`https://diunar.jl-lagrange.com.cn:4001/overview`(查询数据概况)
`https://diunar.jl-lagrange.com.cn:4001/detail`（查询个体数据）
`https://diunar.jl-lagrange.com.cn:4001/switch`（停车位状态切换）
> 注：微信小程序强制要求https访问

请求方式：`POST`

编码方式：`application/x-www-form-urlencoded`

## 参数信息
### 1. 查询数据概况（overview）
- 输入参数

| 参数名称 | 必选 | 类型 | 说明 |
| :-: | :-: | :-: | :-: |
| total | 否 | Boolean | 查询车位总数 |
| idle | 否 | Boolean | 查询闲置车位数量 |
| occupied | 否 | Boolean | 查询占用车位数量 |

- 说明
`total`、`idle`、`occupied` 三个参数最多只能含有一个，若不包含任何参数则以JSON格式返回全部三项数据

- 示例一
**Request:**
POST /overview HTTP/1.1
Host: diunar.jl-lagrange.com.cn:4001
Content-Type: application/x-www-form-urlencoded
Content-Length: 0
**Response:**
{"total":3,"idle":2,"occupied":1}

- 示例二
**Request:**
POST /overview HTTP/1.1
Host: diunar.jl-lagrange.com.cn:4001
Content-Type: application/x-www-form-urlencoded
Content-Length: 10
total=true
**Response:**
3

### 2. 查询个体数据（detail）
- 输入参数

| 参数名称 | 必选 | 类型 | 说明 |
| :-: | :-: | :-: | :-: |
| id | 否 | Int | 查询指定车位状态 |

- 说明
若不包含`id`参数则以JSON数组格式返回全部车位状态
`state`为0表示闲置，1表示占用

- 示例一
**Request:**
POST /detail HTTP/1.1
Host: diunar.jl-lagrange.com.cn:4001
Content-Type: application/x-www-form-urlencoded
Content-Length: 0
**Response:**
[{"id":1,"state":0},{"id":2,"state":1},{"id":3,"state":0}]

- 示例二
**Request:**
POST /detail HTTP/1.1
Host: diunar.jl-lagrange.com.cn:4001
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
id=2
**Response:**
1

### 3. 停车位状态切换（switch）
- 输入参数

| 参数名称 | 必选 | 类型 | 说明 |
| :-: | :-: | :-: | :-: |
| id | 是 | Int | 切换指定车位状态 |

- 说明
若原`state`值为0则切换至1，反之亦然
默认返回报文为空

- 示例
**Request:**
POST /switch HTTP/1.1
Host: diunar.jl-lagrange.com.cn:4001
Content-Type: application/x-www-form-urlencoded
Content-Length: 4
id=3

## 小程序端发起请求示例代码
``` JavaScript
wx.request({
  url: 'https://diunar.jl-lagrange.com.cn:4001/detail',
  data: {
    id: 2
  },
  header: {
    'content-type': 'application/x-www-form-urlencoded'
  },
  success(res) {
    //获得的res.data即为2号停车位的状态码
    console.log(res.data)
  }
})
```
