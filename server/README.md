# Chat Application project
> This folder contains the backend for [Chat Application](../client). It is built using Django REST Framework for the endpoints. 
  
## Features
* User authentication and authorization. 
* Real-time messaging between users in a chat room.  
* User-friendly interface.  

## Installation
1. Create a virtual environment
```sh
python3 -m venv venv
```

2. Install dependencies  
```sh
pip3 install -r requirements.txt
```  

3. Copy the .env.example file to .env and fill in the values in the .env file.  
```sh
cp .env.example .env
```

4. Apply database migrations 
```sh
python3 manage.py migrate
```

5. Run the redis server
```sh
docker run --rm -p 6379:6379 redis:7
```

6. Run the django server
```sh
python3 manage.py runserver
```

## Contributing
Contributions are always welcome! If you have any bug reports, feature requests, or pull requests, please feel free to submit them.
