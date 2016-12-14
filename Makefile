VER=1.0
BUILDIT=rm -rf ~/rpmbuild/SOURCES/$@-${VER}.tar.gz; \
	tar zcf ~/rpmbuild/SOURCES/$@-${VER}.tar.gz $@; \
	rpmbuild --define="VER $(VER)" -bb ./SPECS/$@.spec

.PHONY: license

datetm=`date +%Y%m%d%H`
datetd=`date +%Y%m%d`
strend=.el6.x86_64.rpm

license:
	${BUILDIT}


rpm:license


