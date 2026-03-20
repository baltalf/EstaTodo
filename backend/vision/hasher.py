import hashlib

def hash_file(path: str) -> str:
    """SHA-256 de un archivo. Devuelve hex string."""
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def hash_bytes(data: bytes) -> str:
    """SHA-256 de bytes en memoria."""
    return hashlib.sha256(data).hexdigest()
