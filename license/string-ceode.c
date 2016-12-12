#include <stdio.h> 
#include <string.h>
#include <stdlib.h>

const char base[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 
char* base64_encode(const char* data, int data_len); 
char *base64_decode(const char* data, int data_len); 
static char find_pos(char ch); 

const  char g_char_num[] =  {'0','1','2','3','4','5','6','7',
                            '8','9','A','B','C','D','E','F'};


#define  ORCH_LICENSE_FIRST_BEGIN '3'
#define  ORCH_LICENSE_FIRST_END '9'
#define  ORCH_LICENSE_SECOND_BEGIN 'A'
#define  ORCH_LICENSE_SECOND_END 'H'
#define  ORCH_LICENSE_THIRD_BEGIN 'J'
#define  ORCH_LICENSE_THIRD_END 'N'
#define  ORCH_LICENSE_FOUR_BEGIN 'P'
#define  ORCH_LICENSE_FOUR_END 'Y'

#define MAX_FILE_LEN          5000


/*-----------------------------------------------------
函数功能：对字符串进行base64转码
参数：要转码码的字符串
返回值：base64转码后的字符串
-----------------------------------------------------*/
char *base64_encode(const char* data, int data_len) 
{ 
    int prepare = 0; 
    int ret_len; 
    int temp = 0; 
    char *ret = NULL; 
    char *f = NULL; 
    int tmp = 0; 
    char changed[4]; 
    int i = 0; 
    ret_len = data_len / 3; 
    temp = data_len % 3; 
    if (temp > 0) 
    { 
        ret_len += 1; 
    } 
    ret_len = ret_len*4 + 1; 
    ret = (char *)malloc(ret_len); 
      
    if ( ret == NULL) 
    { 
        printf("No enough memory.\n"); 
        exit(0); 
    } 
    memset(ret, 0, ret_len); 
    f = ret; 
    while (tmp < data_len) 
    { 
        temp = 0; 
        prepare = 0; 
        memset(changed, '\0', 4); 
        while (temp < 3) 
        { 

            if (tmp >= data_len) 
            { 
                break; 
            } 
            prepare = ((prepare << 8) | (data[tmp] & 0xFF)); 
            tmp++; 
            temp++; 
        } 
        prepare = (prepare<<((3-temp)*8)); 
        for (i = 0; i < 4 ;i++ ) 
        { 
            if (temp < i) 
            { 
                changed[i] = 0x40; 
            } 
            else 
            { 
                changed[i] = (prepare>>((3-i)*6)) & 0x3F; 
            } 
            *f = base[changed[i]]; 

            f++; 
        } 
    } 
    *f = '\0'; 
      
    return ret; 
      
} 

static char find_pos(char ch)   
{ 
    char *ptr = (char*)strrchr(base, ch);
    return (ptr - base); 
} 

/*-----------------------------------------------------
函数功能：对base64转码后的字符串进行解码
参数：要解码的字符串
返回值：base64解码后的字符串
-----------------------------------------------------*/
char *base64_decode(const char *data, int data_len) 
{ 
    int ret_len = (data_len / 4) * 3; 
    int equal_count = 0; 
    char *ret = NULL; 
    char *f = NULL; 
    int tmp = 0; 
    int temp = 0; 
    char need[3]; 
    int prepare = 0; 
    int i = 0; 
    if (*(data + data_len - 1) == '=') 
    { 
        equal_count += 1; 
    } 
    if (*(data + data_len - 2) == '=') 
    { 
        equal_count += 1; 
    } 
    if (*(data + data_len - 3) == '=') 
    {
        equal_count += 1; 
    } 
    switch (equal_count) 
    { 
    case 0: 
        ret_len += 4;
        break; 
    case 1: 
        ret_len += 4;
        break; 
    case 2: 
        ret_len += 3;
        break; 
    case 3: 
        ret_len += 2;
        break; 
    } 
    ret = (char *)malloc(ret_len); 
    if (ret == NULL) 
    { 
        printf("No enough memory.\n"); 
        exit(0); 
    } 
    memset(ret, 0, ret_len); 
    f = ret; 
    while (tmp < (data_len - equal_count)) 
    { 
        temp = 0; 
        prepare = 0; 
        memset(need, 0, 4); 
        while (temp < 4) 
        { 
            if (tmp >= (data_len - equal_count)) 
            { 
                break; 
            } 
            prepare = (prepare << 6) | (find_pos(data[tmp])); 
            temp++; 
            tmp++; 
        } 
        prepare = prepare << ((4-temp) * 6); 
        for (i=0; i<3 ;i++ ) 
        { 
            if (i == temp) 
            { 
                break; 
            } 
            *f = (char)((prepare>>((2-i)*8)) & 0xFF); 
            f++; 
        } 
    } 
    *f = '\0'; 
    return ret; 
}

//16位随机字符
static int get_16_random_char(char* str)
{   
    int i = 0;
    for (i=0; i<16; ++i)
    {
        str[i] = g_char_num[random() % 16];
    }
    str[i] = '\0';
    return 0;
}

//对折
static int modify_raw_sn(char* psn)
{
    //if(verify_license_string_legal(psn) == false)
        //return false;
    
    char what;
    int sn_len = strlen(psn);
    int j = 0;
    for(j=0;j< sn_len;j++)
    {
        what = psn[j];
        
        if(ORCH_LICENSE_FIRST_BEGIN <= what && what<= ORCH_LICENSE_FIRST_END)
        {
            psn[j] = ORCH_LICENSE_FIRST_END - (what - ORCH_LICENSE_FIRST_BEGIN);
        }
        else if(ORCH_LICENSE_SECOND_BEGIN  <= what && what <= ORCH_LICENSE_SECOND_END)
        {
            psn[j] = ORCH_LICENSE_SECOND_END - (what - ORCH_LICENSE_SECOND_BEGIN );
        }
        else if(ORCH_LICENSE_THIRD_BEGIN <= what && what <= ORCH_LICENSE_THIRD_END)
        {
            psn[j] = ORCH_LICENSE_THIRD_END - (what - ORCH_LICENSE_THIRD_BEGIN);
        }
        else if(ORCH_LICENSE_FOUR_BEGIN <= what && what <= ORCH_LICENSE_FOUR_END )
        {
            psn[j] = ORCH_LICENSE_FOUR_END  - (what - ORCH_LICENSE_FOUR_BEGIN);
        }
        else
        {
            //verify_license_string_legal
        }
    }
    
    return 0;
}


/*-----------------------------------------------------
函数功能：对字符串进行转码
参数：src 源字符串，str 转码后的字符串
返回值：0 正常， -1 异常
-----------------------------------------------------*/
int encode(char *src, char *str)
{	
	char str_random[20] = {0};
    char buf[MAX_FILE_LEN] = {0};
	char *ret_encode = NULL;
    
    if (src == NULL || str == NULL) {
        return -1;
    }

    get_16_random_char(str_random);
    sprintf(buf, "%s%s", str_random, src);


    ret_encode = base64_encode(buf, strlen(buf)); 
    strcpy(str, ret_encode);

    if(ret_encode != NULL){
        free(ret_encode);
    }
	
    modify_raw_sn(str);
    //printf("ret_encode:%s\n",str);
	
	return 0;
	
}

/*-----------------------------------------------------
函数功能：对转码后的字符串进行解码
参数：src 源字符串，str 解码后的字符串
返回值：0 正常 -1 异常
-----------------------------------------------------*/
int decode(char *src, char *str)
{	
	char buf[MAX_FILE_LEN] = {0};
	char *ret_base64 = NULL;
    char tmp[MAX_FILE_LEN] = {0};

    if (src == NULL || str == NULL) {
        return -1;
    }

    strcpy(tmp, src);
	
    modify_raw_sn(tmp);
    ret_base64 = base64_decode(tmp, strlen(tmp)); 	
	strcpy(buf, ret_base64);
    if(ret_base64 != NULL){
        free(ret_base64);
    }

    sprintf(str,"%s", buf + 16);
    //printf("ret_decode:%s\n", str);
	
	return 0;
	
}

