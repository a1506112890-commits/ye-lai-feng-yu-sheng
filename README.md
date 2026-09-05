# 群友杀 · 真无名杀 Render 单服务版

本项目不重写游戏。它复用 `Firfr/noname-docker` 的无名杀 Web 与 Server 镜像，
用一个 Node 网关把网页静态资源和 WebSocket 联机服务器合并到同一个 Render URL。

部署后根网址应直接显示无名杀网页客户端；联机服务器通过同一域名的 WSS 连接。

详见 `部署步骤.txt`。
