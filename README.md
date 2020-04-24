# Coding 图床

基于 [Coding](https://coding.net/) API 与 Coding 代码仓库实现的 Coding 图床 VSCode 粘贴上传扩展。

## Features

首次使用请进入扩展设置界面配置 `Coding 个人访问令牌` 和 `Coding 仓库地址`。此扩展仅支援在 Markdown 中使用。

1. 可以使用快捷键 `Shift + Alt + V` (可配置) 或右键菜单 `粘贴图片` 。
2. 可以直接粘贴截图或图片文件。
3. 选中文本后粘贴，文本将被作为图片的 Alt 。

## Requirements

Linux 用户须安装 xclip.

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
* `coding-picbed.repository`: 存放图片的仓库。
* `coding-picbed.path`: 存放图片的目录。


## Release Notes

### 1.0.0

完成初版。

**Enjoy!**
