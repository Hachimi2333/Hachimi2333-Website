---
title: ⛏️ 手把手教你搭建Minecraft服务器#3
cover: https://assets.hachimi2333.top/blog/cover/3.webp
categories: [Minecraft, 服务器]
tags: [Minecraft, 服务器]
date: 2022-9-14
---
## 内网穿透

<!-- more -->

之前搭建的服务器只能在我们电脑本地运行，如果想和身处异地的朋友一起玩耍，就需要本节的内网穿透了。

### SakuraFrp

来到[官网](https://www.natfrp.com)，先注册个账号。

来到控制面板后点击`查看访问密钥`，记得保护好你的密钥！

### 下载内网穿透软件

[软件下载](https://www.natfrp.com/tunnel/download)

安装完之后在设置中输入访问密钥，即可完成登录

### 创建隧道

点击隧道界面右上角`+`按钮新建一条隧道。

本地IP填写`127.0.0.1`即可，端口填写`Minecraft服务器的端口`。

隧道类型选择`UDP`，远程端口填写`你喜欢的`。

穿透节点选择**离你位置近的为最佳**。若未**实名认证**，将**无法**创建国内节点！

### 启动节点

点击节点右侧开启按钮，来到`日志`

等待出现以下内容，即可使用日志内IP进行连接。

{% image https://assets.hachimi2333.top/blog/6/tunnel.webp 隧道 fancybox:true %}

## 注意事项

隧道有`流量、速度限制`！