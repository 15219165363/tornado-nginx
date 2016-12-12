//

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include "string-codec.h"

#define RELEASE_VERSION 	"1.0"
#define OPTION_STRING		("hVi:h:u:i:d:l:")

#define OP_GENKEY			1
#define OP_DECODEKEY		2

struct commandline
{
	char *user;
	char *uuid;
	char *license;
	int days;
	int operation;
};

typedef struct commandline commandline_t;

struct license_info
{
	
	unsigned int begin_year; 	//序列号的开始时间
	unsigned int begin_month;
	unsigned int begin_day;
	
	unsigned int days;			//序列号有效天数
	unsigned int end_year;		//序列号过期时间
	unsigned int end_month;
	unsigned int end_day;
	
	unsigned char trial;		//是否为试用序列号

};

char* prog_name = NULL;
#define die(fmt, args...) \
do { \
	fprintf(stderr, "%s: ", prog_name); \
	fprintf(stderr, fmt "\n", ##args); \
	exit(-1); \
} while (0)

static int print_usage()
{
	printf("Usage\n\n");
	printf("<genkey|decodekey> [options]\n\n");
	
	printf("Options:\n");
	printf("  -h                  Print this help, then exit\n");
	printf("  -V                  Print program version information, then exit\n");
	printf("\n");
	
	printf("genkey                Generate a license key\n");
	printf("  -u [user]           Username.\n");
	printf("  -i [id]             Uuid.\n");
	printf("  -d [day]            Valid days of license, after that license will be expired.\n");
	printf("\n");
	
	printf("decodekey             Decode a license key.\n");
	printf("  -l [license]        License key that will be decode.\n");

	printf("\n");
}

static int get_int_arg(char argopt, char *arg)
{
	char *tmp;
	int val;

	val = strtol(arg, &tmp, 10);
	if (tmp == arg || tmp != arg + strlen(arg))
		die("argument to %c (%s) is not an integer", argopt, arg);

	if (val < 0)
		die("argument to %c cannot be negative", argopt);

	return val;
}

static void decode_arguments(int argc, char *argv[], commandline_t *comline)
{
	int cont = 1;
	int optchar;
	int show_help = 0;

	while (cont) {
		optchar = getopt(argc, argv, OPTION_STRING);
		switch (optchar) {
		case 'V':
			printf("license-tool %s (built %s %s)\n", RELEASE_VERSION, __DATE__, __TIME__);
			exit(0);
			break;
		case 'h':
			show_help = 1;
			break;			
		case 'u':
			comline->user = strdup(optarg);
			break;			
		case 'i':
			comline->uuid= strdup(optarg);
			break;
		case 'd':
			comline->days = get_int_arg(optchar, optarg);
			break;
		case 'l':
			comline->license = strdup(optarg);
			break;

		case EOF:
			cont = 0;
			break;
		default:
			die("unknown option: %c", optchar);
			break;
		}
	}
	
	while (optind < argc) {
		if (strcmp(argv[optind], "genkey") == 0) {
			if (comline->operation)
				die("can't specify two operations");
			comline->operation = OP_GENKEY;
		} else if (strcmp(argv[optind], "decodekey") == 0) {
			if (comline->operation)
				die("can't specify two operations");
			comline->operation = OP_DECODEKEY;
		} 
		optind++;
	}
	
	if (show_help){
		print_usage();
		exit(0);
	}
	if (!comline->operation)
		die("no operation specified");
}


int GenerateKey(char *user, char *uuid, int days)
{
	char info[128] = {'\0'};
	char  serial_number[128] = {'\0'};

	sprintf(info, "%s%s%s%s%d", user, "#", uuid, "#", days);
    encode(info, serial_number);
    printf("serial_number:%s\n", serial_number);

	return 0;
}

int main(int argc, char *argv[])
{
	char  lincese_info[128] = {'\0'};	
	commandline_t comline;


	memset(&comline, 0, sizeof(commandline_t));
	decode_arguments(argc, argv, &comline);

	switch (comline.operation) {
		case OP_GENKEY://编码
		{				
			GenerateKey(comline.user, comline.uuid, comline.days);
			break;
		} 
		case OP_DECODEKEY://解码
		{		
			decode(comline.license, lincese_info);	
			printf("license_info:%s\n",lincese_info);
			break;
		} 
		default:
		{
			break;
		}

	}				

	

	return 0;
}