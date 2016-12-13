#ifndef __STRINGCODEC_H_
#define __STRINGCODEC_H_

#ifdef __cplusplus
extern "C"
{
#endif

int encode(char *src, char *str);
int decode(char *src, char *str);

#ifdef __cplusplus
}
#endif

#endif