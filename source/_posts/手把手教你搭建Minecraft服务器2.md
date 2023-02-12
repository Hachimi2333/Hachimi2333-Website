---
title: ⛏️ 手把手教你搭建Minecraft服务器#2
cover: https://assets.hachimi2333.top/blog/cover/3.webp
categories: [Minecraft, 服务器]
tags: [Minecraft, 服务器]
date: 2022-9-13
---
## 安装插件

<!-- more -->

### 下载插件

首先在网上搜索并下载插件程序，插件的扩展名同样为`.jar`。

下面推荐几个网站寻找自己需求的插件。

- [Mcbbs](https://www.mcbbs.net)

可在Mcbbs中服务端插件板块寻找

- [Spigot](https://www.spigotmc.org)
- [Modrinth](https://modrinth.com)

### 安装插件

安装插件的方式很简单，将插件放入**plugins**文件夹中，重启服务器即可。

若使用的为**Sponge**服务端，请把插件放入**mods**文件夹。

## 配置插件

待服务器启动之后，来到`/plugins/`文件夹中，插件一般会为你生成一个文件夹，里面存放的是配置文件和数据。

来到插件文件夹中，一般会找到`config.yml`文件。

配置文件一般是由**YAML**文件构成，在编辑YAML配置文件时，请注意一些关于YAML的注意事项！直接进行编辑可能导致插件报错等问题。

### YAML基本语法

- 大小写敏感
- 使用缩进表示层级关系
- 缩进不允许使用tab，只允许空格（这点非常重要！！）

大部分YAML配置错误的原因都是空格缩进不当。
- '#'表示注释

### 配置文件

了解了YAML的基本语法后，请照着插件文档或配置文件中的注释，配置你的插件吧！
