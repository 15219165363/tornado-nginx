TARGET=license-tool
CC=gcc
FLAG=-fPIC

DESTDIR=
PREFIX=/usr
BINDIR=${PREFIX}/bin

LIB_SOURCES=${TARGET}

all: main.o string-codec.o
	$(CC) -o ${TARGET} $^

main.o:  main.c
	$(CC) -c $^

string-codec.o: string-codec.h string-codec.c
	$(CC) -c $^

clean:
	rm -f *.o ${TARGET}
	rm -f *.h.gch

install:all
	for i in ${LIB_SOURCES}; do install -D -m 0777 ./$$i ${DESTDIR}${BINDIR}/$$i; done

	chmod u+s ${DESTDIR}${BINDIR}/${TARGET}
