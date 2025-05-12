void setup()
{
	Serial.begin(9600);
}

float a = 0;
float x = 0;
float y = 1;
float z = 2;

void loop()
{
    float co2Str  = 10 + a;
    String tempStr = "11";
    String presStr = "12";
    String velStr  = "13";
    String accStr  = "14";

    float temp = tempStr.toFloat() + a;
    float pres = presStr.toFloat() + a;
    float vspd = velStr.toFloat() + a;
    float acc  = accStr.toFloat() + a;

    // Imprimir los datos en el monitor serial
    Serial.println("Datos recibidos:");

    Serial.print("Temp: ");
    Serial.println(temp);

    Serial.print("Presion: ");
    Serial.println(pres);

    Serial.print("CO2: ");
    Serial.println(co2Str);

    Serial.print("Accz: ");
    Serial.println(acc);

    Serial.print("VelV: ");
    Serial.println(vspd);

    Serial.print("Rotaciones: ");
    Serial.print(x);
    Serial.print(" ");
    Serial.print(0);
    Serial.print(" ");
    Serial.println(z);

    a++;
    x += 30;
    y += 0;
    z += 30;
    delay(500);
}
