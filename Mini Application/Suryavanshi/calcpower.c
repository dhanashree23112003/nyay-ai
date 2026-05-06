  #include<stdio.h>

/* Function to calculate x raised to the power y */


int power(int base, unsigned int pow)
{
	if (pow == 0)
		return 1;

	else
		return base*power(base,pow-1);
	
}

/* Program to test function power */
int main()
{
	int base;
	unsigned int pow;

    printf("Enter the 1) Base of Number  and  2)Power of Number to calcuate its Value");
    scanf("%d",&base);
    scanf("%u",&pow);

   
  printf("The value which came after calculating Power is :: ");
	printf("%d", power(base, pow));
	return 0;
}
