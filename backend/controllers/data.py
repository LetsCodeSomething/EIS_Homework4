from app import app 
from flask import request, session
from flask import jsonify

from utils import get_db_connection
from models.data_model import *

@app.route('/data', methods=['get']) 
def index(): 
 
    conn = get_db_connection()
 
    data = get_games(conn)

    arr_data = data.to_json(orient='records')

    return jsonify(arr_data)
