void setup()
{
	Serial.begin(9600);
}

int a = 0;

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
    Serial.print("CO2: ");
    Serial.print(co2Str);
    Serial.println(" ppm");

    Serial.print("Temperatura: ");
    Serial.print(temp);
    Serial.println(" °C");

    Serial.print("Presión: ");
    Serial.print(pres);
    Serial.println(" hPa");

    Serial.print("Velocidad Vertical: ");
    Serial.print(vspd);
    Serial.println(" m/s");

    Serial.print("Aceleración Neta: ");
    Serial.print(acc);
    Serial.println(" m/s²");

    a++;
    delay(1000);
}
