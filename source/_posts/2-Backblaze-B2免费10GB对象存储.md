---
title: 📁 Backblaze B2 免费 10GB 对象存储
categories: [资源分享, 建站资源]
tags: [对象储存, 白嫖党, 建站]
date: 2022-9-11
---
# Backblaze B2 免费 10GB 对象存储

<!-- more -->

## 注册

[点我注册](https://www.backblaze.com/b2/sign-up.html?referrer=nopref)

注册的时候地区选择US West 即美国西部，如图

{% image https://assets.hachimi2333.top/blog/2/b2reg.webp 地区选择US West fancybox:true ratio:1122/600 %}

注册完之后来到后台面板

## 创建储存桶

点击 `Create a new bucket` 创建一个存储桶，名字随意，如图。

{% image https://assets.hachimi2333.top/blog/2/createbucket.webp 创建储存桶 fancybox:true ratio:586/343 %}

创建时请选择公开**public**！

创建好以后，我们点击 `Bucket Settings` ，进行缓存设置。

接下来，在 Bucket Info 里填入 `{"cache-control":"max-age=31536000"}` 设置缓存时长。

待网站加载一会便可以点击上传按钮上传文件了。

上传完之后，点击最右端信息按钮，即可查看文件信息，如图。

{% image https://assets.hachimi2333.top/blog/2/fileinfo.webp 文件信息 fancybox:true ratio:780/540 %}

## 接入 Cloudflare

使用 Cloudflare 接入 Backblaze B2 可以免除流量费用!

在刚才文件信息界面的Friendly URL里，找到根域名，我这里就是 `f004.backblazeb2.com`。

打开 Cloudflare 后台，登录账号，选择域名。

添加记录，记录类型选 `CNAME`，名称随意，然后将Friendly URL里的根域名填进去，打开代理。

{% image https://assets.hachimi2333.top/blog/2/createcname.webp 创建CNAME记录 fancybox:true ratio:965/147 %}

接下来打开 `页面规则` ，添加一个规则，如图。

{% image https://assets.hachimi2333.top/blog/2/createrules.webp 添加页面规则 fancybox:true ratio:774/470 %}

接下来，把 Friendly URL 中的根域名换成你自己接入 Cloudflare 的域名就可以访问了！

无法访问？请往下看。

### 修改SSL/TLS 加密模式

在Cloudflare的控制面板中找到SSL/TLS

修改SSL/TLS 加密模式为 **完全（严格）**，如图

{% image https://assets.hachimi2333.top/blog/2/strictssl.webp SSL/TLS加密模式 fancybox:true ratio:949/525 %}

接下来，把 Friendly URL 中的根域名换成你自己接入 Cloudflare 的域名就可以访问了！

## 注意事项

Backblaze 是有免费额度的。

总共免费 **10GB** 对象存储 + 每天免费 **1GB** 下载流量，不过接入Cloudflare可以免除下载流量。