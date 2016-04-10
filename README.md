## Inspiration

如果你是一个程序员，在看复杂的文档；如果你是一个文学爱好者，在豆瓣评书品诗；如果你是一个知识的渴求者，在知乎探索新的世界……你多么想知道谁和你在做着同一件事，想和他们倾吐你的所有感受。

当你费了千辛万苦注册了一个帐号，却无法知道和你在同一个网页的朋友在干什么；当你看到了一篇文章的评论，却找了半天才找到了评论所指的段落；当你想把对文章的感受一吐为快，却发现网站根本没给你留下评论的一席之地。

我们要把互联网人与人之间的距离拉得更近，并不需要注册帐号，只需要一个插件，你就可以同和你处于同一页面的用户进行在线的交流，也可以把你的评论留在网页的任何段落中。

## What it does

安装我们的 Chrome 扩展插件后，在任意网页中，可以看到在浏览该网页的其他插件用户，并实现在线的实时交流。除此之外，用户在网页中选中一些文字，可以对这些内容进行评论，评论的内容可以被其他浏览该内容的用户看到。

使用了这样的插件，我们实现更加方便的在线交流方式，不需要安装任何其他聊天软件，不需要担心隐私泄露，只需要输入用户名和邮箱，就能够可以和其他人一起看博客、看新闻、对时事点评、对段子吐槽。

在广阔无垠的互联网世界中，你可以和任何一个和你志趣相投的陌生人说话，不需要 QQ 号、微博、手机号，你吐着槽、看着美丽的世界、向每一个和你处于同一个页面的朋友问好，然后挥挥手，不带走一片云彩。

## How we built it

我们制作了 Chrome 的插件，在网页中插入定制的代码，使以下功能得到了实现：

1. 监听对 document 中文字的选择，使得原网页中的所有文字只要被选中，就能够添加评论；
2. 对用户在窗口中的浏览位置进行记录，并使用 Socket 消息与服务器同步，使得每个人能够看见所有人的位置；
3. ​

除此之外，我们利用青云云服务提供的服务器部署了高并发的socket服务器，可以同时处理大量的信息，并实现消息的广播。

## Challenges we ran into

当我们设计完所需的功能点后，一开始实现得还比较顺利，但完成了第一个功能点之后，对这个功能点进行测试，发现互联网中的网页类型较为多样，在自适应的网页中有时会出现不同的行为，例如：不同用户的屏幕大小是不一样的，很难用绝对的度量来标识他们的浏览位置。所以我们考虑了更加通用的方式，以保证对各类页面的适用。

我们计划使用非入侵的方式来高亮显示网页中的任意一段文字，由于网络中的文字都是UGC，各种富文本编辑器生成出的HTML完全不同，这给我们带来了许多挑战。另外，如何定位网页中任意被选中的文字是一件非常困难的工作，浏览器几乎没有提供任何相关的API，我们进行了大量调研，最终采用了非常底层的方法实现了该功能。

## Accomplishments that we are proud of

我们在两天不到的时间里完成了预设的功能点，并在其中应用了很多较先进的web技术。以四人天不到完成了功能文档、界面设计、前后端服务部署以及简单的测试这些完整的产品开发流程。

## What we learned

为了完成我们的功能，我们调研了市场上是否有相关功能的产品，学习了一些较新的技术，也对经典的方法有了更深入的了解，对浏览器行为、服务器部署、网页文档分析等都有了更充分的理解。

## What's next for k-link

我们的网页互联功能插件接下来要完成的功能：

1. 优化在线沟通的交互体验；
2. 增加其他媒体的选择评论功能；
3. 部署支持 https 协议的服务器并申请证书，使更多的网页能够使用插件；
4. 在Firefox、Safari等浏览器中实现同样功能的插件。