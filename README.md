# SmartLamp System Based on User Habits using C5 Algorithm

## Introduction

This repository contains the source code and documentation for a SmartLamp system that adapts to the habits of the residents in a house. The system utilizes the C5 algorithm for classifying habits data. The microcontroller used is the ESP32, and all data is stored in Firebase.

## Features

- **Adaptive Lighting:** The SmartLamp system adjusts the intensity and color temperature of the light based on the habits of the residents.

- **Energy Efficiency:** The system aims to optimize energy consumption by dynamically controlling the lighting conditions.

- **C5 Algorithm Implementation:** The core of the system is built on the C5 algorithm, which classifies habits data to customize lighting preferences.

- **ESP32 Microcontroller:** The system is implemented on the ESP32 microcontroller, providing a compact and efficient solution.

- **Firebase Integration:** All habits and system data are stored securely in Firebase, enabling easy access and analysis.

## Getting Started

### Prerequisites

- Arduino IDE with ESP32 support
- Firebase account
- Python 3.x for local testing
- Required Python packages (listed in `requirements.txt`)

### Installation

1. Clone the repository to your local machine.

   ```bash
   git clone https://github.com/kisnak21/smartlamp-website.git
   cd smartlamp-website
   ```

2. Install the required dependencies.

   ```bash
   cd decision-tree-api
   pip install -r requirements.txt
   ```

3. Set up the ESP32 microcontroller with the provided Arduino sketch in the `esp32` directory.

### Usage

1. Flash the Arduino sketch to the ESP32 microcontroller.

2. Run the SmartLamp system.

   ```bash
   python main.py
   ```

3. Follow the on-screen instructions to set up and configure the SmartLamp system.

## Configuration

- **C5 Algorithm Parameters:** Adjust the dataset that you want to use. It's up to you whatever the format is CSV or XLS.

- **Firebase Configuration:** Update Firebase credentials and connection details in the `firebase_config.json` file.

- **User Preferences:** Users can set their lighting preferences through the SmartLamp mobile app or a web interface.

## Contributing

If you would like to contribute to the project, please follow the [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The C5 algorithm implementation is based on the work presented in the author's thesis or final project.

- Special thanks to all of my friends for their contributions and support.

## Contact

For inquiries and support, please contact [krisnastya21@gmail.com].

Feel free to explore the code and documentation to better understand the implementation of the SmartLamp system. Happy coding!
