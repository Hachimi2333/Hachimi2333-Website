---
abbrlink: ''
categories:
- - 工具
date: '2023-02-12'
tags:
- 工具
- Hash
- 哈希
- Windows
- 文件资源管理器
title: 🔧 Hash值检验工具
updated: '2023-02-12'
---
## 哈希值检验工具

**集成**于**文件资源管理器**中，在**文件资源管理器**中右键文件选择菜单栏中选项即可使用。

<!-- more -->

## 安装

新建文件 `install.reg`

{% folding child:codeblock open:false color:blue install.reg %}

```powershell
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\hash]
"MUIVerb"="校验文件 Hash"
"SubCommands"=""
"Icon"="PowerShell.exe"

; SHA1
[HKEY_CLASSES_ROOT\*\shell\hash\shell\01menu]
"MUIVerb"="SHA1"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\01menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA1 | format-list"

; SHA256
[HKEY_CLASSES_ROOT\*\shell\hash\shell\02menu]
"MUIVerb"="SHA256"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\02menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA256 | format-list"

; SHA384
[HKEY_CLASSES_ROOT\*\shell\hash\shell\03menu]
"MUIVerb"="SHA384"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\03menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA384 | format-list"

; SHA512
[HKEY_CLASSES_ROOT\*\shell\hash\shell\04menu]
"MUIVerb"="SHA512"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\04menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA512 | format-list"

; MACTripleDES
[HKEY_CLASSES_ROOT\*\shell\hash\shell\05menu]
"MUIVerb"="MACTripleDES"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\05menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm MACTripleDES | format-list"

; MD5
[HKEY_CLASSES_ROOT\*\shell\hash\shell\06menu]
"MUIVerb"="MD5"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\06menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm MD5 | format-list"

; RIPEMD160
[HKEY_CLASSES_ROOT\*\shell\hash\shell\07menu]
"MUIVerb"="RIPEMD160"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\07menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm RIPEMD160 | format-list"

; Allget-filehash -literalpath '%1' -algorithm RIPEMD160 | format-list
[HKEY_CLASSES_ROOT\*\shell\hash\shell\08menu]
"CommandFlags"=dword:00000020
"MUIVerb"="校验全部"

[HKEY_CLASSES_ROOT\*\shell\hash\shell\08menu\command]
@="powershell -noexit get-filehash -literalpath '%1' -algorithm SHA1 | format-list;get-filehash -literalpath '%1' -algorithm SHA256 | format-list;get-filehash -literalpath '%1' -algorithm SHA384 | format-list;get-filehash -literalpath '%1' -algorithm SHA512 | format-list;get-filehash -literalpath '%1' -algorithm MACTripleDES | format-list;get-filehash -literalpath '%1' -algorithm MD5 | format-list;get-filehash -literalpath '%1' -algorithm RIPEMD160 | format-list"
```

{% endfolding %}

## 卸载

新建文件 `uninst.reg`

{% folding child:codeblock open:false color:blue uninst.reg %}

```powershell
Windows Registry Editor Version 5.00

[-HKEY_CLASSES_ROOT\*\shell\hash]
```

{% endfolding %}

## 使用方法

双击 `install.reg`安装，双击 `uninst.reg`卸载。

**需要管理员权限**


