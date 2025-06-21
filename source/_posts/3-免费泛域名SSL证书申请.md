---
title: 🔒 免费泛域名 SSL 证书申请
categories: [资源分享, 建站资源]
tags: [SSL, 证书, 白嫖党, 建站]
date: 2022-9-12
---
# 免费泛域名 Let's Encrypt 证书申请

<!-- more -->

## 注册

[点我注册](https://letsencrypt.osfipin.com)

## 申请证书

### 输入域名

注册完来到申请证书，输入域名，勾选**泛域名**，如图。

{% image https://assets.hachimi2333.top/blog/2/domain.webp 输入域名 fancybox:true %}

### 定义CSR

点击下一步定义CSR，选择RSA即可，也可以点击更多填入信息。

### 选择渠道

选择`Let's Encrypt`渠道，支持泛域名，缺点是有效期三个月，如图。

{% image https://assets.hachimi2333.top/blog/2/letsencrypt.webp Let's Encrypt渠道 fancybox:true %}

## 下载证书

完成后下载证书压缩包到本地，解压。内容如图。

{% image https://assets.hachimi2333.top/blog/2/cert.webp 证书压缩包 fancybox:true %}

其中`private.pem`为秘钥，`fullchain.crt`为证书文件，可用记事本打开。

## 注意事项

证书有效期为`3个月`，到期后请重新申请。