# Coding 图床

基于 [Coding](https://coding.net/) API 与 Coding 代码仓库实现的 Coding 图床 VSCode 粘贴上传扩展。

## Features

首次使用请进入扩展设置界面配置 `Coding 个人访问令牌` 和 `Coding 仓库地址`，仓库至少需要设置共享源代码或部署静态网站服务。此扩展仅支援在 Markdown 中使用。

1. 可以使用快捷键 `Shift + Alt + V` (可配置) 或右键菜单 `粘贴图片` 。
2. 可以直接粘贴截图或图片文件。
3. 选中文本后粘贴，文本将被作为图片的 Alt 。

## Requirements

Windows 用户可直接使用，Linux 用户须安装 xclip.

Ubuntu：
```bash
sudo apt install xclip
```

CentOS
```bash
sudo yum install epel-release.noarch
sudo yum install xclip
```

## Extension Settings

* `coding-picbed.createDirectoryByDate`: 是否将图片上传到以日期命名的文件夹。
* `coding-picbed.token`: Coding 的[个人访问令牌](https://help.coding.net/docs/member/tokens.html)。
* `coding-picbed.repository`: 存放图片的仓库，如 `https://coding-demo.coding.net/p/coding-demo/d/coding-demo/git`。
* `coding-picbed.path`: 存放图片的目录。

## Tips

如果以上配置好，在粘贴的时候提示“路径未找到”，可能是代码仓库还没有初始化。可在仓库网页用 README `快速初始化仓库`。

## Release Notes

### 0.0.4

1. 更新 Readme，补充仓库的配置要求。

### 0.0.3

1. 更新 Readme，以便使用更加清晰。

### 0.0.2

1. 修正 Mac 无法粘贴图片文件问题。
2. 修正自动添加 Alt 计数总是 0 的问题。
3. 在状态栏添加上传 loading。

### 0.0.1

完成初版。

**Enjoy!**
