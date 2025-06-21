---
title: 📱 牛蛙助手签名IPA，并开启JIT
categories: [Apple]
tags: [Apple, 牛蛙助手, iOS, iPadOS, IPA, 签名, JIT, 虚拟机]
date: 2022-12-11
---

使用牛蛙助手安装IPA应用，并给应用开启JIT权限，同时支持虚拟定位。仅第一次安装需使用电脑。

<!-- more -->

## 下载

[牛蛙助手官网](https://ios222.com/)

双击打开`BAInstaller.exe`，将手机通过数据线连接到电脑。

{% image https://assets.hachimi2333.top/blog/11/bfinstall.webp 安装牛蛙助手 fancybox:true %}

点击`安装`等待应用安装

找不到应用可以在App资源库中寻找

## 设置

### 安装描述文件

接下来按照应用步骤安装描述文件识别设备UDID。

### 连接专用网络

同时使用时保证`开启牛蛙助手的专用网络`

当看到左上角出现`VPN`图标后即成功

使用时不可断开专用网络

{% image https://assets.hachimi2333.top/blog/11/VPN.webp 连接专用网络 fancybox:true %}

## 使用

{% image https://assets.hachimi2333.top/blog/11/tools.webp 功能 fancybox:true %}

### 签名

进入`IPA签名>证书`点击右上角`+`输入自己AppleID、密码添加个人证书。

个人证书一次最多签名`10`个App，且每七天需要重新签名。

接下来导入IPA，添加到应用库，安装指示先签名再安装，我这里懒就不放图了（

### 开启JIT

部分程序需要JIT权限，如**PojavLauncher，UTM**

进入`JIT`，选择应用，点击启动即可

Tips:每次启动应用均需要从这里启动哦。