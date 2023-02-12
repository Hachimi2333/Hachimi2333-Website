---
title: ⛏️ 手把手教你搭建Minecraft服务器#1
cover: https://assets.hachimi2333.top/blog/cover/3.webp
categories: [Minecraft, 服务器]
tags: [Minecraft, 服务器]
date: 2022-9-12
---
## 说在前面

本教程仅实用于**Java**版Minecraft，操作环境为**Windows**系统，基岩版、Linux请期待。

<!-- more -->

## 要求

 开一个Minecraft服务器，你应该具备的条件有
 
- `Java`运行环境（请准备好Minecraft版本所对应需求的Java版本）
- 一台正常运作的电脑，且运行内存`4G`以上（推荐`8G`及以上）
- 懂一些Minecraft相关知识
- 系统版本推荐属于Windows8.1及以上，或者较新版本的Linux
- 有一副勤劳的双手
- 耐心

## 服务端选择

### 纯净端

- PaperMC（推荐）

Spigot 的进一步优化版本，在相关算法方面，较 Spigot 有所提高，优化 TPS 等，支持 CraftBukkit 和 Spigot 插件，API 没有太大修改。在 1.9 版本之前都带有反作弊功能，1.9 之后的版本需要自行安装其他反作弊插件。

注意：Paper对游戏内一些`“特性”`进行了修复

[官网链接](https://papermc.io/)

- Spigot（较推荐）

Spigot 是 CraftBukkit 服务端之后的延续版本，比 CraftBukkit 优化了不少地方，支持 CraftBukkit 的插件，性能比 CraftBukkit 好很多，并且自带反作弊功能

[官网链接](https://spigotmc.org/)

- 官方服务端（不推荐）

Minecraft Server 是 Mojang 官方制作的原版服务端，更新非常快，基本上和 Minecraft 客户端版本同时发布，**不能安装任何 Mod 和插件**，只能够使用原版的命令和物品，适合基友服联机使用。

[官网链接](https://minecraft.net)

### 模组端

- Arclight（推荐）

Arclight 是在 Forge 上使用 Mixin 实现的 Bukkit 服务端，可在 Forge 环境下加载 Bukkit 插件。支持**高版本**的Minecraft

[GitHub链接](https://github.com/IzzelAliz/Arclight)

- Mohist（推荐）

Mohist 是一个全新的 Minecraft Forge 服务端，核心采用 Forge + Paper 结构，开发环境使用ForgeGradle，支持 Forge mod 和 Paper 系列插件。Mohist 目前稳定性良好，仍在不断更新

[官网链接](https://mohistmc.com/)

- Catserver（推荐）

Catserver推荐**低版本**模组服（1.12.2）使用。

[官网链接](https://catmc.org/)

- Sponge（不推荐）

**插件生态**较差，不推荐使用。

[官网链接](https://spongepowered.org/)

## 启动服务端

选择符合自己的服务端核心，并下载下来，放入你的一个文件夹里，此后你的服务器所有数据将会保存在这里。

**本文档使用Paper最新版1.19.2服务端进行演示(#142)**

相信你已经注意到了，你下载的服务端文件扩展名都是`.jar`，它是一个Java的可执行文件。所谓“开服”，就是要启动这个服务端。

在相同目录内新建一个批处理文件，扩展名为`.bat`，里面的命令代表执行这个程序，右键>编辑，输入内容为：

```
java -Xmx1G -Xms1G -jar server.jar
```

其中`Xmx`与`Xms`代表着分配的最大最小运行内存，通常两者设为相同值，请根据自身电脑配置进行分配。

通常原版纯净服务器**1G~2G**为宜，大型模组服请至少分配**4G**内存以上。

`server.jar`为启动的文件名，请更改成你所下载的文件名。

如果想使用指定Java，而不是默认的，请把Java改成`”指向java.exe的文件路径”`

保存之后，双击运行。首次启动会下载一些依赖库和原版服务端，这段时间可以做一些有意义的事情。欸？怎么突然关闭了？那是因为我们没有同意EULA协议。找到`eula.txt`文件，将其中`false`改为`true`保存即可。

再次双击启动，会出现服务器自带GUI界面，等待服务器加载完毕，出现`Done (XXXs)!`与`Timings Reset`你的服务器就开起来了！

快点进入游戏，IP地址输入`localhost:25565`进入游玩吧！

## 设置OP

OP是服务器的管理员，等服务器开启时，在控制台输入指令`/op Username`即可给予玩家OP权限。“Username”为玩家游戏内名称。

OP将默认拥有最高控制台权限，请谨慎给予玩家OP！

## 配置server.properties

细心的你一定会在服务器根目录发现`server.properties`文件，这里储存的都是服务器的配置文件。

打不开？使用系统自带记事本就可以啦！

### 一些基本设定

`gamemode` 代表游戏模式。

`level-seed` 代表地图种子。其实也可以把`world`、`world_nether`、`world_the_end`文件夹替换为你的世界。

`enable-command-block` 启用命令方块？

`motd` 显示在玩家服务器列表界面的信息。

`difficulty` 游戏难度。

`max-players` 最大玩家数。视自己电脑/服务器配置而定！太多玩家电脑承受不起会导致服务器卡顿崩溃等。

`spawn-protection` 出生点保护，保护出生点周围的方块不被破坏（OP服务器管理员忽视）。个人觉得这个功能有点烦，朋友之间的小服务器可以设置为`0`关闭

### 高级设定

在其中找到`online-mode`一栏，将其改为`false`就可以允许离线（盗版）玩家进入服务器。小心：离线服务器玩家可随意更改用户名进入，为了保护玩家安全，建议关闭此功能或使用登录插件*（将在以后章节谈到）。

此时你可能在想，能不能更换服务器的端口呢？MInecraftJava版服务器端口默认为25565，如果被占用，可以在这里找到``设置，更改为你所需要的端口。

## 注意事项

当前你的服务器仅开启在本地，是无法和身处异地的朋友们玩耍的。要解决这个问题，可以申请公网IP或**内网穿透**。

内网穿透将在以后章节谈到。