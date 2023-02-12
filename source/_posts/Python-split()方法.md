---
title: 🔧 Python split()方法
categories: [Python]
tags: [Python, 笔记]
date: 2022-10-25
---

## 语法


```
str.split(str="", num=string.count(str))
```

- str 分隔符，默认为空白
- num 分割次数，默认为所有

<!-- more -->

## 实例

- 输入`a b c`三个整数的值，用空格分隔，分别输出a,b,c的值

```Python
a,b,c=input().split()
a=int(a)
b=int(b)
c=int(c)
print(a)
print(b)
print(c)
```