1.����MySQL��service mysqld start

2.���ԣ�
2-1������mysql��mysql
2-2���˳�mysql��\q �� ctrl + c

3.���ÿ���������chkconfig mysqld on

4.����3306�˿ڲ����棺
    /sbin/iptables -I INPUT -p tcp --dport 3306 -j ACCEPT
    /etc/rc.d/init.d/iptables save

5.��������:
����1��
5-1:����mysql
5-2��use mysql;
     update user set password='123456'where user='root';
     flush privileges;

����2��
5-1��mysql -u root
5-2��SET PASSWORD FOR 'root'@'localhost' = PASSWORD('123456');


6.����mysql����
    service mysqld restart

7.���MySQL�������⣺
    7-1����һ�������ļ������Ƶ�/etc/Ŀ¼������Ϊmy.cnf����ʱ��û��my.cnf��
    7-2��cp /usr/share/doc/mysql-server-5.1.73/my-medium.cnf /etc/my.cnf
    7-3��vim my.cnf
         ��[client]��[mysqld]���涼�����default-character-set=utf8
    7-4������mysql����

