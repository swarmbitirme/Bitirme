from microbit import *
import urm10
import maqueenMotor

uart.init(baudrate=9600,bits=8,parity=None,stop=1,tx=None,rx=None)

mind_n_leftMotor = 0
mind_n_step = 5
mind_n_wasTurn = 0
mind_n_start = 0
mind_n_back = 0

motor = maqueenMotor()
mind_n_step = 5
mind_n_leftMotor = 0
mind_n_rightMotor = 0
mind_n_wasTurn = 0
while True:
  print("5")
  #display.scroll(mind_n_step)
  if(mind_n_start == 0):
    byteString = uart.readline()
    formattedString = str(byteString).strip()[2]
    #display.scroll(formattedString)  
    if(formattedString == "0"):
      mind_n_start=1
      mind_n_step = 0
  if (mind_n_back == 0) and (mind_n_step != 5) and (mind_n_wasTurn == 0):
    if (urm10.read(2,1) <= 12):
      mind_n_step = 1
  if (mind_n_step == 0):
    if (pin13.read_digital() == 0) and (pin14.read_digital() == 0):
      mind_n_wasTurn = 0
      mind_n_leftMotor = 75
      mind_n_rightMotor = 75
      motor.run(1,0,mind_n_leftMotor)
      motor.run(0,0,mind_n_rightMotor)
      sleep(50)
      motor.run(0,0,0)
      motor.run(0,0,0)
    else:
      if (pin13.read_digital() == 1) and (pin14.read_digital() == 0):
        mind_n_wasTurn = 1
        mind_n_leftMotor = 40
        mind_n_rightMotor = 0
        motor.run(0,0,mind_n_leftMotor)
        motor.run(1,0,mind_n_rightMotor)
        sleep(0.1 * 1000)
        motor.run(0,0,0)
        motor.run(0,0,0)
        if (pin13.read_digital() == 1) and (pin14.read_digital() == 1):
          mind_n_leftMotor = 40
          mind_n_rightMotor = 0
          motor.run(0,0,mind_n_leftMotor)
          motor.run(1,0,mind_n_rightMotor)
          sleep(0.2 * 1000)
          motor.run(0,0,0)
          motor.run(0,0,0)
        else:
          pass
        if (pin13.read_digital() == 1) and (pin14.read_digital() == 1):
          mind_n_leftMotor = 40
          mind_n_rightMotor = 0
          motor.run(0,0,mind_n_leftMotor)
          motor.run(1,0,mind_n_rightMotor)
          sleep(0.2 * 1000)
          motor.run(0,0,0)
          motor.run(0,0,0)
        else:
          pass
      else:
        if (pin13.read_digital() == 0) and (pin14.read_digital() == 1):
          mind_n_wasTurn = 1
          mind_n_leftMotor = 0
          mind_n_rightMotor = 40
          motor.run(0,0,mind_n_leftMotor)
          motor.run(1,0,mind_n_rightMotor)
          sleep(0.1 * 1000)
          motor.run(0,0,0)
          motor.run(0,0,0)
          if (pin13.read_digital() == 1) and (pin14.read_digital() == 1):
            mind_n_leftMotor = 0
            mind_n_rightMotor = 40
            motor.run(0,0,mind_n_leftMotor)
            motor.run(1,0,mind_n_rightMotor)
            sleep(0.2 * 1000)
            motor.run(0,0,0)
            motor.run(0,0,0)
          else:
            pass
          if (pin13.read_digital() == 1) and (pin14.read_digital() == 1):
            mind_n_leftMotor = 0
            mind_n_rightMotor = 40
            motor.run(0,0,mind_n_leftMotor)
            motor.run(1,0,mind_n_rightMotor)
            sleep(0.2 * 1000)
            motor.run(0,0,0)
            motor.run(0,0,0)
          else:
            pass          
        else:
          mind_n_leftMotor = 0
          mind_n_rightMotor = 0
          motor.run(0,0,mind_n_leftMotor)
          motor.run(1,0,mind_n_rightMotor)
          mind_n_step = 2
  else:
    if (mind_n_step == 1):
      motor.run(1,0,63)
      motor.run(0,1,63)
      sleep(1000)
      motor.run(0,1,0)
      motor.run(1,1,0)
      sleep(2 * 1000)      
      motor.run(0,1,60)
      motor.run(1,1,60)
      sleep(700)
      motor.run(0,1,0)
      motor.run(1,1,0)
      sleep(3*1000)
      mind_n_step=0
      mind_n_back=1
    else:
      if(mind_n_step == 2):
        motor.run(1,0,63)
        motor.run(0,1,63)
        sleep(1000)
        motor.run(0,1,0)
        motor.run(1,1,0)
        motor.run(0,1,60)
        motor.run(1,1,60)
        sleep(200)
        motor.run(0,0,40)
        motor.run(1,0,40)
        sleep(200)
        motor.run(0,1,0)
        motor.run(1,1,0)
        print("2")
        mind_n_step = 5
        mind_n_back = 0 
        mind_n_start = 0
  


