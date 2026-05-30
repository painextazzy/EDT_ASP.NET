namespace back.Dtos;

public class CoursDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
}

public class CreateCoursDto
{
    public string Code { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
}

public class UpdateCoursDto
{
    public string Code { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
}