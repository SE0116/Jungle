"""
FastAPI 서버를 실행하는 스크립트
app 객체를 통해 FastAPI의 설정을 할 수 있다.
"""
from fastapi import FastAPI, HTTPException
# from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from domain.user import user_router
from domain.image import image_router
from domain.album import album_router

import subprocess

app = FastAPI()


# CORS를 허용할 오리진 도메인, 포트를 설정
origins = [
    "http://localhost:3000", # react의 포트
    "http://localhost:8000",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# 라우터를 등록
app.include_router(user_router.router)
app.include_router(image_router.router)
app.include_router(album_router.router)

@app.get("/main")
def main_page():
    # html_file_path = "../yongjae/mainpage.html"
    try:
        # with open(html_file_path, "r") as f:
        #     return HTMLResponse(content=f.read(), status_code=200)
        
        print("main page")
        return RedirectResponse(url="http://localhost:3000/login")
    except FileNotFoundError:        
        return HTTPException(status_code=404, detail="File not found.")
    # return {"message": "메인 화면입니다."}

@app.get("/")
def root():
    return RedirectResponse(url="/main")

@app.get("/login")
def login_page():
    html_file_path = "../yongjae/login.html"
    try:
        with open(html_file_path, "r") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except FileNotFoundError:        
        return HTTPException(status_code=404, detail="File not found.")

@app.get("/signup")
def signup_page():
    html_file_path = "../yongjae/signup.html"
    try:
        with open(html_file_path, "r") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except FileNotFoundError:        
        return HTTPException(status_code=404, detail="File not found.")

@app.get("/group/select")
def gruop_select_page():
    html_file_path = "../yongjae/selectGroup.html"
    try:
        with open(html_file_path, "r") as f:
            return HTMLResponse(content=f.read(), status_code=200)
    except FileNotFoundError:        
        return HTTPException(status_code=404, detail="File not found.")

@app.get("/group/album")
def gruop_album_page():
    return RedirectResponse(url="http://localhost:3000")

# @app.on_event("startup")
# async def startup_event():
#     print("FastAPI 서버 실행 중...")
#     print("watchdog_for_image.py 실행 중...")
#     subprocess.Popen(["python3", "domain/image/image_process/watchdog_for_image.py"])
    
    