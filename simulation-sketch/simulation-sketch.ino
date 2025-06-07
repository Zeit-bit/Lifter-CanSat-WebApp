// Sketch de simulación de datos para desarrollo sin el cansat
void setup()
{
	Serial.begin(9600);
    Serial.println("=== RECEPTOR LORA ACTIVO ===");
}

float a = 0;
float x = 0;
float y = 1;
float z = 2;

void loop()
{
    float co2  = 10 + a;
    float temp = 11 + a;
    float pres = 12 + a;
    float vspd  = 13 + a;
    float acc  = 14 + a;

    // Imprimir los datos en el monitor serial
    Serial.println("=== RECEPTOR ===");

    Serial.print("Temp: ");
    Serial.println(temp);

    Serial.print("Presion: ");
    Serial.println(pres);

    Serial.print("CO2: ");
    Serial.println(co2);

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
    y += 30;
    z += 30;
    delay(500);
}
