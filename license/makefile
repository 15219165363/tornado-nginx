TARGET=license-tool
CC=gcc
FLAG=-fPIC

DESTDIR=
PREFIX=/usr
BINDIR=${PREFIX}/bin

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
	chmod u+s ${DESTDIR}${BINDIR}/${TARGET}
