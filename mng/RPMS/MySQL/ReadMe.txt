1.启动MySQL：service mysqld start

2.测试：
2-1：进入mysql：mysql
2-2：退出mysql：\q 或 ctrl + c

3.设置开机启动：chkconfig mysqld on

4.开启3306端口并保存：
    /sbin/iptables -I INPUT -p tcp --dport 3306 -j ACCEPT
    /etc/rc.d/init.d/iptables save

5.设置密码:
方法1：
5-1:进入mysql
5-2：use mysql;
     update user set password='123456'where user='root';
     flush privileges;

方法2：
5-1：mysql -u root
5-2：SET PASSWORD FOR 'root'@'localhost' = PASSWORD('123456');


6.重启mysql服务：
    service mysqld restart

7.解决MySQL乱码问题：
    7-1：找一个配置文件，复制到/etc/目录，命名为my.cnf（有时候没有my.cnf）
    7-2：cp /usr/share/doc/mysql-server-5.1.73/my-medium.cnf /etc/my.cnf
    7-3：vim my.cnf
         在[client]和[mysqld]下面都添加上default-character-set=utf8
    7-4：重启mysql服务

