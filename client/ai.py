import random
secret_number=random.randint(1,100)
for i in range(7):
    try:
        user_input=int(input("enter your guess"))
        if(user_input==secret_number):
            print("Great Guess!")
            break
        else:
            print("umbuu")
            if(user_input>secret_number and user_input<=100):
                print("my number is less than",user_input)
            elif(user_input<secret_number and user_input>=0):
                print("my number is greater than",user_input)
            elif(user_input<0 or user_input>100):
                print("Your  number is also invalid")
    except ValueError:
        print("number ah mattum kudu da sunni") 
if(user_input!=secret_number):
    print("SRY TRAILS ARE OVER UMBUUU")           
else:
    print("periya pollu than nee")


 
